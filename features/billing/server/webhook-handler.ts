import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

import { prisma } from "@/lib/db";

type RazorpaySubscriptionPayload = {
  id: string;
  current_end?: number;
  notes?: { userId?: string };
};

type RazorpayWebhookBody = {
  event: string;
  payload: {
    subscription?: {
      entity: RazorpaySubscriptionPayload;
    };
  };
};

function isSignatureValid(body: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(body).digest("hex");

  if (expected.length !== signature.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function getRenewsAt(currentEnd?: number): Date | null {
  if (!currentEnd) {
    return null;
  }

  return new Date(currentEnd * 1000);
}

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
