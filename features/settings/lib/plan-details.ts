import type { SubscriptionPlan } from "@/features/dashboard/lib/types";

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
