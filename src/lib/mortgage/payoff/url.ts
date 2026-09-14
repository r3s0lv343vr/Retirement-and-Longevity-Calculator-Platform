import { makeYearMonth } from "./dates";
import { mergePayoffInput } from "./defaults";
import type { PayoffMortgageInput } from "./types";

const KEYS = {
  balance: "b",
  annualRate: "r",
  entryMode: "m",
  currentPayment: "p",
  remainingYears: "ty",
  remainingMonths: "tm",
  extraMonthly: "x",
  startYear: "sy",
  startMonth: "sm",
  freedomYear: "fy",
  freedomMonth: "fm",
  timingAnnual: "ta",
} as const;

export function payoffToSearchParams(input: PayoffMortgageInput): URLSearchParams {
  const params = new URLSearchParams();
  params.set(KEYS.balance, String(input.balance));
  params.set(KEYS.annualRate, String(input.annualRate));
  params.set(KEYS.entryMode, input.entryMode);
  params.set(KEYS.currentPayment, String(input.currentPayment));
  params.set(KEYS.remainingYears, String(input.remainingYears));
  params.set(KEYS.remainingMonths, String(input.remainingMonths));
  params.set(KEYS.extraMonthly, String(input.extraMonthly));
  params.set(KEYS.startYear, String(input.start.year));
  params.set(KEYS.startMonth, String(input.start.month));
  params.set(KEYS.freedomYear, String(input.freedom.year));
  params.set(KEYS.freedomMonth, String(input.freedom.month));
  params.set(KEYS.timingAnnual, String(input.timingAnnual));
  return params;
}

export function payoffFromSearchParams(params: URLSearchParams): PayoffMortgageInput | null {
  if (![KEYS.balance, KEYS.annualRate, KEYS.currentPayment, KEYS.extraMonthly].some((key) => params.has(key))) {
    return null;
  }
  const base = mergePayoffInput({
    balance: params.has(KEYS.balance) ? Number(params.get(KEYS.balance)) : undefined,
    annualRate: params.has(KEYS.annualRate) ? Number(params.get(KEYS.annualRate)) : undefined,
    entryMode: params.get(KEYS.entryMode) === "payment" ? "payment" : "term",
    currentPayment: params.has(KEYS.currentPayment) ? Number(params.get(KEYS.currentPayment)) : undefined,
    remainingYears: params.has(KEYS.remainingYears) ? Number(params.get(KEYS.remainingYears)) : undefined,
    remainingMonths: params.has(KEYS.remainingMonths) ? Number(params.get(KEYS.remainingMonths)) : undefined,
    extraMonthly: params.has(KEYS.extraMonthly) ? Number(params.get(KEYS.extraMonthly)) : undefined,
    timingAnnual: params.has(KEYS.timingAnnual) ? Number(params.get(KEYS.timingAnnual)) : undefined,
    start:
      params.has(KEYS.startYear) || params.has(KEYS.startMonth)
        ? makeYearMonth(Number(params.get(KEYS.startYear) ?? 2026), Number(params.get(KEYS.startMonth) ?? 10))
        : undefined,
    freedom:
      params.has(KEYS.freedomYear) || params.has(KEYS.freedomMonth)
        ? makeYearMonth(Number(params.get(KEYS.freedomYear) ?? 2041), Number(params.get(KEYS.freedomMonth) ?? 10))
        : undefined,
  });
  return base;
}

export function writePayoffUrl(input: PayoffMortgageInput): void {
  const next = `?${payoffToSearchParams(input).toString()}`;
  window.history.replaceState(window.history.state, "", next);
}

export function readPayoffFromLocation(): PayoffMortgageInput | null {
  return payoffFromSearchParams(new URLSearchParams(window.location.search));
}
