/**
 * Client button to cancel an active Razorpay Pro subscription.
 *
 * Calls a server action that talks to Razorpay's API. The user keeps Pro access
 * until the end of the billing period; usage limits apply again after that.
 *
 * @module features/billing/components/cancel-subscription-button
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { statusButtonClass } from "@/features/dashboard/lib/status-styles";
import { cancelSubscription } from "@/lib/actions/billing";
import { Button } from "@/components/ui/button";

type CancelSubscriptionButtonProps = {
  /** When true, the button cannot be clicked (e.g. already canceled). */
  disabled?: boolean;
};

/**
 * Renders a cancel button for the settings / billing UI.
 *
 * @param props - Component props.
 * @param props.disabled - Optional flag to disable the button.
 * @returns Outline danger-styled button with loading state.
 */
export function CancelSubscriptionButton({
  disabled = false,
}: CancelSubscriptionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    setLoading(true);

    try {
      await cancelSubscription();
      toast.success("Subscription canceled. Pro access continues until renewal date.");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not cancel subscription.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleCancel}
      disabled={disabled || loading}
      className={statusButtonClass.danger}
    >
      {loading ? "Canceling…" : "Cancel subscription"}
    </Button>
  );
}
