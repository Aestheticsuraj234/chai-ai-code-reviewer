/**
 * Loads everything the settings page needs in one server call.
 *
 * Combines profile fields from Prisma with subscription state (Razorpay / Pro)
 * and monthly review usage so the UI can show plan, limits, and account info.
 *
 * @module features/settings/server/get-settings
 */

import type { UserSettings } from "@/features/settings/types/settings";
import { getUsageSummary } from "@/features/billing/server/usage";
import { prisma } from "@/lib/db";

import { getUserSubscription } from "./subscription";

/**
 * Fetches profile, subscription, and usage for the settings screen.
 *
 * @param userId - The logged-in user's id.
 * @returns `UserSettings` object for rendering the settings page.
 * @throws If no user row exists for `userId`.
 */
export async function getUserSettings(userId: string): Promise<UserSettings> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const subscription = await getUserSubscription(userId);
  // Usage limits: free users see `used / 5`; Pro users see `used` with no cap.
  const usage = await getUsageSummary(userId);

  return {
    profile: {
      name: user.name,
      email: user.email,
      image: user.image,
      memberSince: user.createdAt.toISOString(),
    },
    subscription,
    usage,
  };
}
