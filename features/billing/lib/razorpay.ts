/**
 * Server-side Razorpay SDK singleton.
 *
 * Razorpay handles subscriptions and payments in India. This module creates one
 * shared client using our API key + secret — never expose the secret to the browser.
 *
 * @module features/billing/lib/razorpay
 */

import Razorpay from "razorpay";

/** Cached Razorpay instance so we do not re-initialize on every server action. */
let razorpay: Razorpay | null = null;

/**
 * Returns the shared Razorpay client for creating or canceling subscriptions.
 *
 * Used by server code only. The checkout UI uses `NEXT_PUBLIC_RAZORPAY_KEY_ID`
 * with Razorpay's hosted checkout script instead.
 *
 * @returns A singleton `Razorpay` SDK instance configured from env vars.
 */
export function getRazorpay() {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  return razorpay;
}
