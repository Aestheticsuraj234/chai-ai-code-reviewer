/**
 * Razorpay payment webhook endpoint.
 *
 * Razorpay sends POST requests when subscription events occur (payment captured,
 * subscription activated, etc.). The handler verifies the signature and updates
 * the user's billing state in the database.
 */

import { handleRazorpayWebhook } from "@/features/billing/server/webhook-handler";

/**
 * Receives Razorpay webhook POST payloads.
 *
 * @param request - Incoming Request with Razorpay event JSON body.
 * @returns Response from the billing webhook handler (typically 200 OK).
 */
export async function POST(request: Request) {
  return handleRazorpayWebhook(request);
}
