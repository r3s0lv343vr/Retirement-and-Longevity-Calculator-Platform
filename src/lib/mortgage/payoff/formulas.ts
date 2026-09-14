import { money } from "./money";

/** Standard fixed-rate payment: M = P × [r(1+r)^n / ((1+r)^n − 1)]. */
export function paymentFromBalanceRateTerm(
  balance: number,
  periodicRate: number,
  periods: number,
): number {
  if (balance <= 0 || periods <= 0) return 0;
  if (Math.abs(periodicRate) < 1e-12) return balance / periods;
  const pow = (1 + periodicRate) ** periods;
  return (balance * periodicRate * pow) / (pow - 1);
}

/**
 * Remaining whole periods to retire `balance` at a fixed payment.
 * Returns null when the payment never covers interest.
 */
export function remainingTermFromBalanceRatePayment(
  balance: number,
  periodicRate: number,
  payment: number,
): number | null {
  if (balance <= 0) return 0;
  if (payment <= 0) return null;
  if (Math.abs(periodicRate) < 1e-12) return Math.ceil(balance / payment - 1e-10);
  const interest = balance * periodicRate;
  if (payment <= interest) return null;
  const n = Math.log(payment / (payment - balance * periodicRate)) / Math.log(1 + periodicRate);
  return Math.max(1, Math.ceil(n - 1e-9));
}

export function monthlyRate(annualRate: number): number {
  return annualRate / 12;
}

export function interestForPeriod(balance: number, periodicRate: number): number {
  return money(balance * periodicRate);
}
