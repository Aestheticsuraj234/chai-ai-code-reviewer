import "server-only";

import { getRazorpay } from "@/features/billing/lib/razorpay";
import { getUserSubscription } from "@/features/billing/server/subscription";
import { prisma } from "@/lib/db";

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
  const razorpaySubscription = await razorpay.subscriptions.create({
    plan_id: planId,
    total_count: 12,
    customer_notify: 1,
    notes: { userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      razorpaySubscriptionId: razorpaySubscription.id,
      subscriptionStatus: "pending",
    },
  });

  return { subscriptionId: razorpaySubscription.id };
}
