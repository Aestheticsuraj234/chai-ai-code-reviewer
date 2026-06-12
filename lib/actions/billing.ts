/**
 * @module lib/actions/billing
 * @description Server Actions for Pro subscription billing.
 *
 * Wraps Stripe (or billing provider) logic from `features/billing/` so Client
 * Components can upgrade or cancel plans without exposing secret keys. Every
 * action checks the session first — billing changes always require a logged-in user.
 */

"use server";

import { cancelProSubscription } from "@/features/billing/server/cancel-subscription";
import { createProSubscription } from "@/features/billing/server/create-subscription";
import { getServerSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

/**
 * Creates a Pro checkout session (or equivalent) for the current user.
 *
 * @description Returns whatever the billing layer needs for the client — often a
 * Stripe Checkout URL or session ID for redirect. Guests are sent to sign-in.
 * @returns Checkout payload from {@link createProSubscription} (shape depends on billing setup).
 */
export async function startProSubscription() {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  return createProSubscription(session.user.id);
}

/**
 * Cancels the current user's Pro subscription at period end (or immediately per provider rules).
 *
 * @description Does not return data to the client; the UI typically revalidates or
 * refreshes subscription state after this action completes.
 * @returns Resolves when cancellation has been recorded with the payment provider.
 */
export async function cancelSubscription() {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  await cancelProSubscription(session.user.id);
}
