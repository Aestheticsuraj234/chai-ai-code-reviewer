/**
 * React hook for responsive "mobile" layout detection.
 *
 * Uses `matchMedia` with a 768px breakpoint (Tailwind's `md` default).
 * Returns a boolean suitable for conditionally rendering mobile-only UI.
 */

import * as React from "react"

/** Viewport width below this value is considered "mobile". Matches Tailwind `md`. */
const MOBILE_BREAKPOINT = 768

/**
 * Tracks whether the viewport is narrower than the mobile breakpoint.
 *
 * Starts as `undefined` during SSR/hydration, then resolves to `true` or `false`.
 * The return value coerces `undefined` to `false` so callers always get a boolean.
 *
 * @returns `true` when viewport width is less than 768px.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // matchMedia is more efficient than resize listeners for breakpoint checks
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    // Set initial value on mount
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
