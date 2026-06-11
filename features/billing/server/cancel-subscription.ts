import "server-only";

import { getRazorpay } from "@/features/billing/lib/razorpay";
import { prisma } from "@/lib/db";

export async function cancelProSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { razorpaySubscriptionId: true },
  });

  if (!user?.razorpaySubscriptionId) {
    throw new Error("No active subscription found.");
  }

  const razorpay = getRazorpay();
  await razorpay.subscriptions.cancel(user.razorpaySubscriptionId, 1);

  await prisma.user.update({
    where: { id: userId },
    data: { subscriptionStatus: "canceled" },
  });
}
