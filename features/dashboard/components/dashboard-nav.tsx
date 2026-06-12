/**
 * Sidebar navigation links for the dashboard workspace.
 *
 * Highlights the active route by comparing the current pathname against each
 * nav item's href. Child routes (e.g. `/dashboard/pull-requests/abc`) also
 * match their parent section.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderGit2Icon,
  GitPullRequestIcon,
  LayoutDashboardIcon,
  SettingsIcon,
} from "lucide-react";

import { GithubIcon } from "@/features/dashboard/components/icons/github-icon";

import {
  DASHBOARD_NAV_ITEMS,
  type DashboardRoute,
} from "@/features/dashboard/lib/routes";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

/** Maps icon keys from `DASHBOARD_NAV_ITEMS` to actual React icon components. */
const NAV_ICONS = {
  "layout-dashboard": LayoutDashboardIcon,
  "folder-git-2": FolderGit2Icon,
  "git-pull-request": GitPullRequestIcon,
  github: GithubIcon,
  settings: SettingsIcon,
} as const;

/**
 * Determines whether a nav link should appear active for the current URL.
 *
 * Overview (`/dashboard`) uses exact match so sub-routes don't highlight it.
 * Other sections match themselves and any nested path (e.g. PR detail pages).
 *
 * @param pathname - Current path from `usePathname()`.
 * @param href - The nav item's target route.
 * @returns `true` when the link should show the active state.
 */
function isNavActive(pathname: string, href: DashboardRoute) {
  if (href === "/dashboard") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Renders the "Workspace" group of sidebar navigation links.
 *
 * @returns A sidebar group with one link per `DASHBOARD_NAV_ITEMS` entry.
 */
export function DashboardNav() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const Icon = NAV_ICONS[item.icon];
            const active = isNavActive(pathname, item.href);

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={active}
                  tooltip={item.title}
                  render={
                    <Link href={item.href}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  }
                />
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
