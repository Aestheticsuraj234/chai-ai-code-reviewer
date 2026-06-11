import type { UserSubscription } from "@/features/dashboard/lib/types";

export type UsageSummary = {
  used: number;
  limit: number | null;
};

export type SettingsProfile = {
  name: string;
  email: string;
  image: string | null;
  memberSince: string;
};

export type UserSettings = {
  profile: SettingsProfile;
  subscription: UserSubscription;
  usage: UsageSummary;
};
