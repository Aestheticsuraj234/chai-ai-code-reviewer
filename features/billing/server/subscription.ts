import "server-only";

import type {
  SubscriptionPlan,
  UserSubscription,
} from "@/features/dashboard/lib/types";
import { prisma } from "@/lib/db";

function getPlanFromDb(plan: string): SubscriptionPlan {
  if (plan === "pro") {
    return "pro";
  }
  return "free";
}

function getStatusFromDb(
  plan: SubscriptionPlan,
  subscriptionStatus: string | null,
  subscriptionRenewsAt: Date | null
): UserSubscription["status"] {
  if (plan !== "pro") {
    return "active";
  }

  if (subscriptionStatus === "canceled") {
    if (subscriptionRenewsAt && subscriptionRenewsAt > new Date()) {
      return "active";
    }
    return "canceled";
  }

  if (subscriptionStatus === "pending") {
    return "trialing";
  }

  if (subscriptionStatus === "active") {
    return "active";
  }

  return "canceled";
}

function getEffectivePlan(
  plan: SubscriptionPlan,
  status: UserSubscription["status"]
): SubscriptionPlan {
  if (plan === "pro" && status === "active") {
    return "pro";
  }

  return "free";
}

export async function getUserSubscription(
  userId: string
): Promise<UserSubscription> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      subscriptionStatus: true,
      subscriptionRenewsAt: true,
    },
  });

  if (!user) {
    return {
      plan: "free",
      status: "active",
      renewsAt: null,
    };
  }

  const dbPlan = getPlanFromDb(user.plan);
  const status = getStatusFromDb(
    dbPlan,
    user.subscriptionStatus,
    user.subscriptionRenewsAt
  );
  const plan = getEffectivePlan(dbPlan, status);

  let renewsAt: string | null = null;
  if (user.subscriptionRenewsAt) {
    renewsAt = user.subscriptionRenewsAt.toISOString();
  }

  return {
    plan,
    status,
    renewsAt,
  };
}
