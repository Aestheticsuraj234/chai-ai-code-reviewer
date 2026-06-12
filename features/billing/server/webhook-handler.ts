/**
 * Entry point for Razorpay subscription webhook HTTP requests.
 *
 * Razorpay POSTs events when a subscription is activated, charged, or canceled.
 * We verify the signature, then update the user's plan and renewal date in Prisma.
 *
 * @module features/billing/server/webhook-handler
 */

import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

import { prisma } from "@/lib/db";

/** Subset of Razorpay subscription fields we read from webhook payloads. */
type RazorpaySubscriptionPayload = {
  id: string;
  current_end?: number;
  notes?: { userId?: string };
};

/** Top-level shape of a Razorpay webhook JSON body. */
type RazorpayWebhookBody = {
  event: string;
  payload: {
    subscription?: {
      entity: RazorpaySubscriptionPayload;
    };
  };
};

/**
 * Verifies `X-Razorpay-Signature` using HMAC-SHA256 and our webhook secret.
 *
 * @param body - Raw request body string (must match what Razorpay signed).
 * @param signature - Value of the `x-razorpay-signature` header.
 * @returns `true` when the signature is valid.
 */
function isSignatureValid(body: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(body).digest("hex");

  if (expected.length !== signature.length) {
    return false;
  }

  // timingSafeEqual avoids leaking info about the correct signature via timing.
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/** Converts Razorpay's Unix `current_end` (seconds) to a JavaScript `Date`. */
function getRenewsAt(currentEnd?: number): Date | null {
  if (!currentEnd) {
    return null;
  }

  return new Date(currentEnd * 1000);
}

/**
 * Finds our user id for a Razorpay subscription.
 *
 * Tries `razorpaySubscriptionId` first, then falls back to `notes.userId`
 * from when we created the subscription.
 */
async function findUserForSubscription(subscription: RazorpaySubscriptionPayload) {
  const bySubscriptionId = await prisma.user.findFirst({
    where: { razorpaySubscriptionId: subscription.id },
    select: { id: true },
  });

  if (bySubscriptionId) {
    return bySubscriptionId.id;
  }

  const userId = subscription.notes?.userId;
  if (!userId) {
    return null;
  }

  return userId;
}

/** User completed checkout — flip them to Pro and store renewal date. */
async function activateSubscription(subscription: RazorpaySubscriptionPayload) {
  const userId = await findUserForSubscription(subscription);
  if (!userId) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: "pro",
      razorpaySubscriptionId: subscription.id,
      subscriptionStatus: "active",
      subscriptionRenewsAt: getRenewsAt(subscription.current_end),
    },
  });
}

/** Recurring charge succeeded — refresh when the next period ends. */
async function updateRenewalDate(subscription: RazorpaySubscriptionPayload) {
  const userId = await findUserForSubscription(subscription);
  if (!userId) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionRenewsAt: getRenewsAt(subscription.current_end),
    },
  });
}

/** Subscription ended — mark canceled (user may still have access until `current_end`). */
async function cancelSubscription(subscription: RazorpaySubscriptionPayload) {
  const userId = await findUserForSubscription(subscription);
  if (!userId) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { subscriptionStatus: "canceled" },
  });
}

/**
 * Handles an incoming Razorpay webhook `Request`.
 *
 * Supported events:
 * - `subscription.activated` — first payment succeeded, enable Pro
 * - `subscription.charged` — renewal payment, update `subscriptionRenewsAt`
 * - `subscription.cancelled` — user or system canceled the subscription
 *
 * @param request - Raw `Request` from the Razorpay webhook API route.
 * @returns JSON `Response`; 401 if signature is invalid.
 */
export async function handleRazorpayWebhook(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!isSignatureValid(body, signature)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body) as RazorpayWebhookBody;
  const subscription = event.payload.subscription?.entity;

  if (!subscription) {
    return Response.json({ received: true });
  }

  if (event.event === "subscription.activated") {
    await activateSubscription(subscription);
  }

  if (event.event === "subscription.charged") {
    await updateRenewalDate(subscription);
  }

  if (event.event === "subscription.cancelled") {
    await cancelSubscription(subscription);
  }

  return Response.json({ received: true });
}
