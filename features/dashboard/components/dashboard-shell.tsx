/**
 * Layout wrapper that pairs the sidebar with the main content area.
 *
 * `SidebarProvider` manages open/collapsed state and keyboard shortcuts.
 * `TooltipProvider` is required because sidebar buttons use tooltips when collapsed.
 */

import type { UserMenuUser } from "@/components/user/user-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

type DashboardShellProps = {
  children: React.ReactNode;
  user: UserMenuUser;
  plan?: string;
};

/**
 * Two-column dashboard layout: sidebar + scrollable main content.
 *
 * @param children - Page content rendered inside `SidebarInset`.
 * @param user - Session user forwarded to the sidebar user menu.
 * @param plan - Optional plan label for the user menu badge.
 * @returns The full dashboard chrome wrapping `{children}`.
 */
export function DashboardShell({
  children,
  user,
  plan,
}: DashboardShellProps) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <DashboardSidebar user={user} plan={plan} />
        <SidebarInset className="min-h-svh">{children}</SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
