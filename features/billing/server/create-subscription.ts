/**
 * Creates a Razorpay subscription before the user opens checkout.
 *
 * Flow: server creates subscription → returns id → client opens Razorpay Checkout
 * with that `subscription_id` → Razorpay webhook activates Pro after payment.
 *
 * @module features/billing/server/create-subscription
 */

import "server-only";

import { getRazorpay } from "@/features/billing/lib/razorpay";
import { getUserSubscription } from "@/features/billing/server/subscription";
import { prisma } from "@/lib/db";

/**
 * Starts the Pro upgrade by creating a Razorpay subscription on the server.
 *
 * @param userId - The logged-in user who is upgrading; stored in Razorpay `notes`
 *   so webhooks can link payment back to this account.
 * @returns `{ subscriptionId }` passed to Razorpay Checkout on the client.
 * @throws If the user already has active Pro or `RAZORPAY_PLAN_ID` is missing.
 */
export async function createProSubscription(userId: string) {
  const subscription = await getUserSubscription(userId);

  if (subscription.plan === "pro" && subscription.status === "active") {
    throw new Error("You already have an active Pro subscription.");
  }

  const planId = process.env.RAZORPAY_PLAN_ID;
  if (!planId) {
    throw new Error("Razorpay plan is not configured.");
  }

  const razorpay = getRazorpay();
  // `notes.userId` helps the webhook find our user if lookup by subscription id fails.
  const razorpaySubscription = await razorpay.subscriptions.create({
    plan_id: planId,
    total_count: 12,
    customer_notify: 1,
    notes: { userId },
  });

  // `pending` until Razorpay sends `subscription.activated` via webhook.
  await prisma.user.update({
    where: { id: userId },
    data: {
      razorpaySubscriptionId: razorpaySubscription.id,
      subscriptionStatus: "pending",
    },
  });

  return { subscriptionId: razorpaySubscription.id };
}
