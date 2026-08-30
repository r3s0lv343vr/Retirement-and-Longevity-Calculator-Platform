export function formatMoney(value: number, digits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatAge(value: number): string {
  return `${Math.round(value)}`;
}

export function formatMonths(months: number): string {
  const whole = Math.round(months);
  const years = Math.floor(whole / 12);
  const rem = whole % 12;
  if (years <= 0) return `${whole} month${whole === 1 ? "" : "s"}`;
  if (rem === 0) return `${whole} months (${years} year${years === 1 ? "" : "s"})`;
  return `${whole} months (${years} year${years === 1 ? "" : "s"} ${rem} month${rem === 1 ? "" : "s"})`;
}
