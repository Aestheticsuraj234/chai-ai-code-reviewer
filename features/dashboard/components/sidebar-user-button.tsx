/**
 * Footer slot in the dashboard sidebar that shows the signed-in user.
 *
 * Wraps the shared `UserMenu` dropdown with sidebar-specific layout classes
 * so the trigger stretches full width like other sidebar items.
 */

"use client";

import { UserMenu, type UserMenuUser } from "@/components/user/user-menu";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

type SidebarUserButtonProps = {
  user: UserMenuUser;
  plan?: string;
};

/**
 * Displays the user account menu at the bottom of the dashboard sidebar.
 *
 * @param user - Name, email, and avatar from the auth session.
 * @param plan - Billing plan label shown in the dropdown (e.g. "Free").
 * @returns A sidebar menu item containing the profile dropdown trigger.
 */
export function SidebarUserButton({ user, plan }: SidebarUserButtonProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserMenu
          user={user}
          plan={plan}
          variant="profile"
          // Deep selectors align the dropdown trigger with sidebar button sizing
          className="w-full [&_button]:h-12 [&_button]:w-full [&_button]:justify-start [&_button]:gap-2 [&_button]:px-2"
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
