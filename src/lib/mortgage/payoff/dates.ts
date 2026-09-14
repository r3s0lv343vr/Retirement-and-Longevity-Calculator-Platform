export type YearMonth = {
  year: number;
  month: number;
};

export function clampMonth(month: number): number {
  if (!Number.isFinite(month)) return 1;
  return Math.min(12, Math.max(1, Math.round(month)));
}

export function makeYearMonth(year: number, month: number): YearMonth {
  return { year: Math.round(year), month: clampMonth(month) };
}

export function addMonths(date: YearMonth, n: number): YearMonth {
  const idx = date.year * 12 + (date.month - 1) + n;
  const year = Math.floor(idx / 12);
  const monthIndex = idx - year * 12;
  return { year, month: monthIndex + 1 };
}

export function monthsBetween(from: YearMonth, to: YearMonth): number {
  return (to.year - from.year) * 12 + (to.month - from.month);
}

export function compareYearMonth(a: YearMonth, b: YearMonth): number {
  return a.year === b.year ? a.month - b.month : a.year - b.year;
}

export function sameYearMonth(a: YearMonth, b: YearMonth): boolean {
  return a.year === b.year && a.month === b.month;
}

export function isOnOrAfter(date: YearMonth, start: YearMonth): boolean {
  return compareYearMonth(date, start) >= 0;
}

export function isOnOrBefore(date: YearMonth, end: YearMonth): boolean {
  return compareYearMonth(date, end) <= 0;
}

export function inYearMonthRange(date: YearMonth, start: YearMonth, end?: YearMonth): boolean {
  if (!isOnOrAfter(date, start)) return false;
  if (!end) return true;
  return isOnOrBefore(date, end);
}

export function formatYearMonth(date: YearMonth): string {
  return new Date(date.year, date.month - 1, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Whole days from the first of `from` to the first of `to`. */
export function daysBetweenFirsts(from: YearMonth, to: YearMonth): number {
  const a = Date.UTC(from.year, from.month - 1, 1);
  const b = Date.UTC(to.year, to.month - 1, 1);
  return Math.round((b - a) / 86_400_000);
}
