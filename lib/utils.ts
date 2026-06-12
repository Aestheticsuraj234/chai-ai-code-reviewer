/**
 * @module lib/utils
 * @description Small shared utilities used across UI components.
 *
 * This is a common pattern in shadcn/ui projects: one helper for merging
 * Tailwind class names without style conflicts.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges class names and resolves conflicting Tailwind utilities.
 *
 * @description `clsx` handles conditional classes (`cn("p-4", isActive && "bg-blue-500")`).
 * `twMerge` ensures later classes win when both set the same utility (e.g. `p-2` vs `p-4`).
 * @param inputs - Class values: strings, arrays, or conditional objects accepted by `clsx`.
 * @returns A single space-separated class string safe for `className`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
