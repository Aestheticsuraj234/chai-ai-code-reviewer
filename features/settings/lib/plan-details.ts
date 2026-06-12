/**
 * Human-readable labels and feature bullets for each subscription plan.
 *
 * Used on the settings page to explain Free vs Pro — including the monthly
 * review limit on Free and unlimited reviews on Pro.
 *
 * @module features/settings/lib/plan-details
 */

import type { SubscriptionPlan } from "@/features/dashboard/lib/types";

/**
 * Display copy for each plan tier.
 *
 * Keys match `SubscriptionPlan` (`free` | `pro`). Feature strings are shown
 * as bullet points in the settings UI.
 */
export const PLAN_DETAILS: Record<
  SubscriptionPlan,
  { label: string; features: string[] }
> = {
  free: {
    label: "Free",
    features: [
      "Up to 5 AI reviews per month",
      "Public repositories only",
      "Community support",
    ],
  },
  pro: {
    label: "Pro",
    features: [
      "Unlimited AI reviews on connected repos",
      "Public and private repository support",
      "Priority support",
    ],
  },
};
