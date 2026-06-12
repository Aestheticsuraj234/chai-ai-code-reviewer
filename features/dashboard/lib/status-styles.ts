/**
 * Reusable Tailwind class helpers for status badges and action buttons.
 *
 * Semantic tones (success, warning, danger, etc.) keep visual language
 * consistent across the dashboard — green for connected, amber for warnings, etc.
 */

import { cn } from "@/lib/utils";

/** Background, border, and text colors for inline status badges. */
export const statusBadgeClass = {
  success:
    "border-green-500/40 bg-green-500/15 text-green-700 dark:text-green-400",
  warning:
    "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-400",
  danger: "border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-400",
  info: "border-blue-500/40 bg-blue-500/15 text-blue-700 dark:text-blue-400",
  neutral: "border-border bg-muted text-muted-foreground",
} as const;

/** Button variants for primary actions like "Install" or "Disconnect". */
export const statusButtonClass = {
  success:
    "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500/50 dark:bg-green-600 dark:hover:bg-green-500",
  danger:
    "border-red-500/50 bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/20",
  warning:
    "border-amber-500/50 bg-amber-500/10 text-amber-800 hover:bg-amber-500/20 dark:text-amber-400",
} as const;

/**
 * Builds a complete className string for a small status badge pill.
 *
 * @param tone - Semantic color from `statusBadgeClass` keys.
 * @param className - Optional extra classes (e.g. `gap-1` when an icon is inside).
 * @returns A merged Tailwind class string ready for a `<span>`.
 */
export function statusBadge(
  tone: keyof typeof statusBadgeClass,
  className?: string
) {
  return cn(
    "inline-flex items-center rounded-none border px-2 py-0.5 text-xs font-medium capitalize",
    statusBadgeClass[tone],
    className
  );
}
