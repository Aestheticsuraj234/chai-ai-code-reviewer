/**
 * TypeScript types for the user settings page payload.
 *
 * `getUserSettings` returns this shape — profile from auth, subscription from
 * Razorpay-backed billing, and usage from monthly review counts.
 *
 * @module features/settings/types/settings
 */

import type { UserSubscription } from "@/features/dashboard/lib/types";

/** How many AI reviews the user has used this month, and their plan's limit. */
export type UsageSummary = {
  /** Completed reviews this calendar month. */
  used: number;
  /** Monthly cap for free users; `null` means unlimited (Pro). */
  limit: number | null;
};

/** Basic account info shown on the settings profile section. */
export type SettingsProfile = {
  name: string;
  email: string;
  image: string | null;
  /** ISO date when the user signed up. */
  memberSince: string;
};

/** Full settings page data: who you are, what plan you have, how much you've used. */
export type UserSettings = {
  profile: SettingsProfile;
  subscription: UserSubscription;
  usage: UsageSummary;
};
