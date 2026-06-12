/**
 * Reads a user's subscription plan and status from the database.
 *
 * Razorpay webhooks update raw fields (`plan`, `subscriptionStatus`, `subscriptionRenewsAt`).
 * This module translates those into a clean `UserSubscription` object for the UI.
 *
 * @module features/billing/server/subscription
 */

import "server-only";

import type {
  SubscriptionPlan,
  UserSubscription,
} from "@/features/dashboard/lib/types";
import { prisma } from "@/lib/db";

/** Normalizes the string stored in Prisma to our `SubscriptionPlan` union. */
function getPlanFromDb(plan: string): SubscriptionPlan {
  if (plan === "pro") {
    return "pro";
  }
  return "free";
}

/**
 * Maps database subscription fields to a user-facing status.
 *
 * Pro users who canceled but are still inside the paid period stay `active`
 * until `subscriptionRenewsAt` passes — they keep Pro features until then.
 */
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

/** Pro features only apply when plan is pro AND status is still active. */
function getEffectivePlan(
  plan: SubscriptionPlan,
  status: UserSubscription["status"]
): SubscriptionPlan {
  if (plan === "pro" && status === "active") {
    return "pro";
  }

  return "free";
}

/**
 * Loads the current subscription snapshot for a user.
 *
 * @param userId - The user whose plan and renewal date we need.
 * @returns `UserSubscription` with effective plan, status, and optional `renewsAt` ISO string.
 */
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
