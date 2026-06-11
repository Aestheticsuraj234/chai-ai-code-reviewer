import { startOfMonth } from "date-fns";

export const FREE_MONTHLY_LIMIT = 5;

export function getMonthStart(): Date {
  return startOfMonth(new Date());
}
