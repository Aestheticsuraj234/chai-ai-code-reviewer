/**
 * Free-tier usage limits for AI code reviews.
 *
 * Pro users bypass these limits in `server/usage.ts`. Free users get a fixed
 * number of completed reviews per calendar month.
 *
 * @module features/billing/lib/limits
 */

import { startOfMonth } from "date-fns";

/** Maximum AI reviews a free user can complete per month. */
export const FREE_MONTHLY_LIMIT = 5;

/**
 * Returns midnight at the start of the current calendar month (local time).
 *
 * We count `reviewed` pull requests with `reviewedAt >= getMonthStart()` so
 * usage resets automatically each month without a cron job.
 *
 * @returns `Date` at the first moment of the current month.
 */
export function getMonthStart(): Date {
  return startOfMonth(new Date());
}
