/**
 * Top bar shown on every dashboard page.
 *
 * Contains the sidebar toggle (for mobile/collapsed mode) and the page
 * title + optional description passed by each route's `page.tsx`.
 */

"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

type DashboardHeaderProps = {
  title: string;
  description?: string;
};

/**
 * Renders the sticky dashboard page header with sidebar trigger.
 *
 * @param title - Primary heading (e.g. "Repositories").
 * @param description - Optional subtitle shown below the title.
 * @returns A `<header>` element with sidebar toggle and title block.
 */
export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
      {/* Opens/closes the sidebar on smaller screens or icon-collapsed mode */}
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex min-w-0 flex-col">
        <h1 className="truncate text-sm font-medium">{title}</h1>
        {description ? (
          <p className="truncate text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </header>
  );
}
