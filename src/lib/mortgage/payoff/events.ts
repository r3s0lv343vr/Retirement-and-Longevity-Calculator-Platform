import {
  daysBetweenFirsts,
  daysInMonth,
  inYearMonthRange,
  monthsBetween,
  sameYearMonth,
  type YearMonth,
} from "./dates";
import { money } from "./money";
import type { PaycheckCadence, PaymentEvent } from "./types";

export function eventApplies(event: PaymentEvent, date: YearMonth): boolean {
  if (event.type === "lumpSum") return sameYearMonth(event.start, date);
  if (event.type === "pause") return inYearMonthRange(date, event.start, event.end);
  return inYearMonthRange(date, event.start, event.end);
}

/**
 * Count paydays that fall in `date`'s calendar month.
 * Weekly and biweekly start on the 1st of the event start month, then every 7 or 14 days.
 * Semimonthly is the 1st and the 15th — two extras every month in range.
 */
export function paycheckCountInMonth(
  cadence: PaycheckCadence,
  date: YearMonth,
  anchor: YearMonth,
): number {
  if (cadence === "semimonthly") return 2;
  const interval = cadence === "weekly" ? 7 : 14;
  const last = daysInMonth(date.year, date.month);
  const daysFromAnchor = daysBetweenFirsts(anchor, date);
  const rem = ((daysFromAnchor % interval) + interval) % interval;
  const firstDay = rem === 0 ? 1 : interval - rem + 1;
  let count = 0;
  for (let day = firstDay; day <= last; day += interval) count += 1;
  return count;
}

export function extraFromEvent(event: PaymentEvent, date: YearMonth): number {
  if (event.type === "pause") return 0;
  if (!eventApplies(event, date)) return 0;
  if (event.amount <= 0) return 0;

  switch (event.type) {
    case "monthly":
    case "temporary":
      return money(event.amount);
    case "annual": {
      const month = event.calendarMonth && event.calendarMonth >= 1 && event.calendarMonth <= 12
        ? event.calendarMonth
        : 12;
      return date.month === month ? money(event.amount) : 0;
    }
    case "lumpSum":
      return money(event.amount);
    case "escalating": {
      const yearsIn = Math.max(0, Math.floor(monthsBetween(event.start, date) / 12));
      const growth = event.annualIncrease ?? 0;
      return money(event.amount * (1 + growth) ** yearsIn);
    }
    case "paycheck":
      return money(event.amount * paycheckCountInMonth(event.cadence ?? "biweekly", date, event.start));
    default:
      return 0;
  }
}

/** Extra principal this period after pauses suppress other events. */
export function extraForPeriod(events: PaymentEvent[], date: YearMonth): number {
  const paused = events.some((event) => event.type === "pause" && eventApplies(event, date));
  if (paused) return 0;
  return money(events.reduce((sum, event) => sum + extraFromEvent(event, date), 0));
}

export function recurringMonthlyFromEvents(events: PaymentEvent[]): number {
  return money(
    events
      .filter((event) => event.type === "monthly" || event.type === "temporary" || event.type === "escalating")
      .reduce((sum, event) => sum + Math.max(0, event.amount), 0),
  );
}

export function newEventId(prefix = "ev"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
