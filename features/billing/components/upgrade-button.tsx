/**
 * Client button that opens Razorpay Checkout for the Pro plan.
 *
 * Razorpay Checkout is a hosted payment modal loaded from their CDN script.
 * We create the subscription on the server first, then pass `subscription_id`
 * to Checkout so Razorpay can collect payment and fire webhooks to activate Pro.
 *
 * @module features/billing/components/upgrade-button
 */

"use client";

import { useRouter } from "next/navigation";
import Script from "next/script";
import { useState } from "react";
import { toast } from "sonner";

import { statusButtonClass } from "@/features/dashboard/lib/status-styles";
import { startProSubscription } from "@/lib/actions/billing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/** Minimal type for the global `window.Razorpay` constructor from checkout.js. */
type RazorpayCheckout = new (options: Record<string, unknown>) => {
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: RazorpayCheckout;
  }
}

/** Official Razorpay Checkout script — loads the payment modal in the browser. */
const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * Renders "Upgrade to Pro" and launches Razorpay Checkout on click.
 *
 * @returns Button plus lazy-loaded Razorpay script tag.
 */
export function UpgradeButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!key) {
      toast.error("Razorpay is not configured yet.");
      return;
    }

    if (!window.Razorpay) {
      toast.error("Checkout is still loading, please try again in a moment.");
      return;
    }

    setLoading(true);

    try {
      // Server creates the Razorpay subscription and returns its id for Checkout.
      const { subscriptionId } = await startProSubscription();

      const checkout = new window.Razorpay({
        key,
        subscription_id: subscriptionId,
        name: "Chai Code Reviewer",
        description: "Pro plan — unlimited AI reviews",
        handler: () => {
          // Payment UI closed successfully — webhook will flip plan to Pro shortly.
          toast.success("Payment successful! Your Pro plan will activate shortly.");
          router.refresh();
        },
      });

      checkout.open();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not start checkout.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script src={RAZORPAY_SCRIPT_URL} strategy="lazyOnload" />
      <Button
        onClick={handleUpgrade}
        disabled={loading}
        className={cn(statusButtonClass.success)}
      >
        {loading ? "Opening checkout…" : "Upgrade to Pro"}
      </Button>
    </>
  );
}
