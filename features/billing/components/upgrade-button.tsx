"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { statusButtonClass } from "@/features/dashboard/lib/status-styles";
import { startProSubscription } from "@/lib/actions/billing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type RazorpayCheckout = new (options: Record<string, unknown>) => {
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: RazorpayCheckout;
  }
}

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout."));
    document.body.appendChild(script);
  });
}

export function UpgradeButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!key) {
      toast.error("Razorpay is not configured yet.");
      return;
    }

    setLoading(true);

    try {
      const { subscriptionId } = await startProSubscription();
      await loadRazorpayScript();

      if (!window.Razorpay) {
        throw new Error("Razorpay checkout failed to load.");
      }

      const checkout = new window.Razorpay({
        key,
        subscription_id: subscriptionId,
        name: "Chai Code Reviewer",
        description: "Pro plan — unlimited AI reviews",
        handler: () => {
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
    <Button
      onClick={handleUpgrade}
      disabled={loading}
      className={cn(statusButtonClass.success)}
    >
      {loading ? "Opening checkout…" : "Upgrade to Pro"}
    </Button>
  );
}
