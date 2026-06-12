/**
 * Settings page body with Profile and Subscription tabs.
 *
 * Profile fields are read-only (sourced from GitHub). Subscription tab shows
 * plan details, usage, and upgrade/cancel actions via billing components.
 */

"use client";

import { format } from "date-fns";

import { CancelSubscriptionButton } from "@/features/billing/components/cancel-subscription-button";
import { UpgradeButton } from "@/features/billing/components/upgrade-button";
import {
  getDisplayName,
  getInitials,
} from "@/components/user/user-menu";
import { statusBadge } from "@/features/dashboard/lib/status-styles";
import type { UserSubscription } from "@/features/dashboard/lib/types";
import { PLAN_DETAILS } from "@/features/settings/lib/plan-details";
import type {
  SettingsProfile,
  UsageSummary,
} from "@/features/settings/types/settings";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SettingsContentProps = {
  profile: SettingsProfile;
  subscription: UserSubscription;
  usage: UsageSummary;
};

/**
 * Formats a renewal ISO date for display, or returns null when absent.
 *
 * @param renewsAt - Subscription renewal timestamp or null.
 * @returns Formatted date like "June 12, 2026", or null.
 */
function formatRenewalDate(renewsAt: string | null): string | null {
  if (!renewsAt) {
    return null;
  }

  return format(new Date(renewsAt), "MMMM d, yyyy");
}

/**
 * Maps subscription status enum to a lowercase label for the UI.
 *
 * @param status - `active`, `trialing`, or `canceled`.
 * @returns Display string for the status line.
 */
function getSubscriptionStatusLabel(status: UserSubscription["status"]): string {
  if (status === "active") {
    return "active";
  }

  if (status === "trialing") {
    return "trialing";
  }

  return "canceled";
}

/**
 * Profile tab — avatar, read-only name/email, member since date.
 *
 * @param profile - User profile from GitHub OAuth.
 * @returns Profile card content.
 */
function ProfileTab({ profile }: { profile: SettingsProfile }) {
  const displayName = getDisplayName(profile);
  const initials = getInitials(profile);
  const memberSince = format(new Date(profile.memberSince), "MMMM d, yyyy");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Account information from your GitHub sign-in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            {profile.image ? (
              <AvatarImage src={profile.image} alt={displayName} />
            ) : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">{profile.email}</p>
            <p className="text-xs text-muted-foreground">Member since {memberSince}</p>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" defaultValue={profile.name} readOnly />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              defaultValue={profile.email}
              readOnly
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Profile details are managed by GitHub. Update them in your GitHub
          account settings.
        </p>
      </CardFooter>
    </Card>
  );
}

/**
 * Builds the monthly usage summary line for the subscription tab.
 *
 * @param usage - Review count used and optional monthly limit.
 * @returns Sentence describing current usage.
 */
function getUsageText(usage: UsageSummary): string {
  if (usage.limit === null) {
    return `${usage.used} reviews used this month (unlimited)`;
  }

  return `${usage.used} / ${usage.limit} reviews used this month`;
}

/**
 * Subscription tab — plan card, usage, feature list, billing actions.
 *
 * @param subscription - Current plan and billing status.
 * @param usage - Monthly AI review usage counts.
 * @returns Subscription management card.
 */
function SubscriptionTab({
  subscription,
  usage,
}: {
  subscription: UserSubscription;
  usage: UsageSummary;
}) {
  const planDetails = PLAN_DETAILS[subscription.plan];
  const renewalDate = formatRenewalDate(subscription.renewsAt);
  const statusLabel = getSubscriptionStatusLabel(subscription.status);

  const isActive = subscription.status === "active" || subscription.status === "trialing";

  // Visual styling reflects active vs inactive subscription
  let cardBorderClass = "border-border";
  let planTextClass = "text-foreground";
  let statusTextClass = "text-muted-foreground";
  let badgeTone: "success" | "neutral" | "warning" = "neutral";

  if (isActive) {
    cardBorderClass = "border-green-500/25";
    planTextClass = "text-green-800 dark:text-green-300";
    statusTextClass = "text-green-700 dark:text-green-400";
    badgeTone = "success";
  }

  if (subscription.status === "canceled") {
    badgeTone = "warning";
  }

  return (
    <Card className={cardBorderClass}>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>
          Manage your plan and billing for AI code reviews.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-4 rounded-none border p-4",
            isActive
              ? "border-green-500/30 bg-green-500/5"
              : "border-border bg-muted/30"
          )}
        >
          <div>
            <p className={cn("font-medium", planTextClass)}>
              {planDetails.label} plan
            </p>
            <p className="text-xs text-muted-foreground">
              Status:{" "}
              <span className={statusTextClass}>{statusLabel}</span>
            </p>
            {renewalDate ? (
              <p className="text-xs text-muted-foreground">
                Renews {renewalDate}
              </p>
            ) : null}
          </div>
          <span className={statusBadge(badgeTone)}>{planDetails.label}</span>
        </div>
        <p className="text-xs text-muted-foreground">{getUsageText(usage)}</p>
        <ul className="space-y-2 text-xs text-muted-foreground">
          {planDetails.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {subscription.plan === "free" ? <UpgradeButton /> : null}
        {subscription.plan === "pro" ? (
          <CancelSubscriptionButton
            disabled={subscription.status === "canceled"}
          />
        ) : null}
      </CardFooter>
    </Card>
  );
}

/**
 * Settings page with tabbed Profile and Subscription sections.
 *
 * @param profile - User profile data from the server.
 * @param subscription - Billing subscription state.
 * @param usage - Monthly review usage summary.
 * @returns Tabbed settings UI below `DashboardHeader`.
 */
export function SettingsContent({
  profile,
  subscription,
  usage,
}: SettingsContentProps) {
  return (
    <div className="flex flex-1 flex-col p-6">
      <Tabs defaultValue="profile" className="w-full max-w-2xl">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          <ProfileTab profile={profile} />
        </TabsContent>

        <TabsContent value="subscription" className="mt-6 space-y-6">
          <SubscriptionTab subscription={subscription} usage={usage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
