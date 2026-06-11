"use server";

import { cancelProSubscription } from "@/features/billing/server/cancel-subscription";
import { createProSubscription } from "@/features/billing/server/create-subscription";
import { getServerSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export async function startProSubscription() {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  return createProSubscription(session.user.id);
}

export async function cancelSubscription() {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  await cancelProSubscription(session.user.id);
}
