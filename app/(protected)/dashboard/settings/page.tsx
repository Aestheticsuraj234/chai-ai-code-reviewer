/**
 * Settings page (`/dashboard/settings`).
 *
 * Profile and subscription management. Data is loaded server-side via
 * `getUserSettings` and passed to the client `SettingsContent` tabs.
 */

import type { Metadata } from "next";

import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { SettingsContent } from "@/features/dashboard/components/settings-content";
import { getUserSettings } from "@/features/settings/server/get-settings";
import { requireAuth } from "@/lib/auth-session";

export const metadata: Metadata = {
  title: "Settings · Dashboard",
};

/**
 * User settings page with profile and subscription tabs.
 *
 * @returns Header and tabbed settings content for the signed-in user.
 */
export default async function DashboardSettingsPage() {
  const session = await requireAuth();
  const settings = await getUserSettings(session.user.id);

  return (
    <>
      <DashboardHeader
        title="Settings"
        description="Manage your profile and subscription."
      />
      <SettingsContent
        profile={settings.profile}
        subscription={settings.subscription}
        usage={settings.usage}
      />
    </>
  );
}
