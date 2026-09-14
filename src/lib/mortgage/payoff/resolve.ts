import { addMonths } from "./dates";
import { monthlyRate, paymentFromBalanceRateTerm, remainingTermFromBalanceRatePayment } from "./formulas";
import { money } from "./money";
import type { PayoffMortgageInput, ResolvedMortgage } from "./types";

export const MAX_REMAINING_PERIODS = 600;

export function remainingPeriodsFromInput(input: PayoffMortgageInput): number {
  const months = Math.round(input.remainingYears) * 12 + Math.round(input.remainingMonths);
  return Math.min(MAX_REMAINING_PERIODS, Math.max(1, months));
}

export function resolveMortgage(input: PayoffMortgageInput): ResolvedMortgage {
  const periodicRate = monthlyRate(input.annualRate);
  const balance = money(input.balance);

  if (input.entryMode === "payment") {
    const scheduledPayment = money(Math.max(0, input.currentPayment));
    const remaining =
      remainingTermFromBalanceRatePayment(balance, periodicRate, scheduledPayment) ?? MAX_REMAINING_PERIODS;
    return {
      balance,
      annualRate: input.annualRate,
      periodicRate,
      scheduledPayment,
      remainingPeriods: remaining,
      start: input.start,
      naturalPayoff: addMonths(input.start, remaining - 1),
    };
  }

  const remainingPeriods = remainingPeriodsFromInput(input);
  const scheduledPayment = money(paymentFromBalanceRateTerm(balance, periodicRate, remainingPeriods));
  return {
    balance,
    annualRate: input.annualRate,
    periodicRate,
    scheduledPayment,
    remainingPeriods,
    start: input.start,
    naturalPayoff: addMonths(input.start, remainingPeriods - 1),
  };
}
