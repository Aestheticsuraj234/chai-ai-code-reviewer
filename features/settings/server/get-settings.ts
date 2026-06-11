import type { UserSettings } from "@/features/settings/types/settings";
import { getUsageSummary } from "@/features/billing/server/usage";
import { prisma } from "@/lib/db";

import { getUserSubscription } from "./subscription";

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
