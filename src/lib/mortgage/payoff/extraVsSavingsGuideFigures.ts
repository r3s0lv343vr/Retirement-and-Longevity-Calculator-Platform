import { calculateInterestAvoided, calculateTimeReclaimed, simulateAmortization } from "./amortization";
import { PAYOFF_START } from "./defaults";
import { resolveMortgage } from "./resolve";
import type { PayoffMortgageInput } from "./types";

/** Worked example from the extra-versus-savings guide. */
export const EXTRA_VS_SAVINGS_INPUT: PayoffMortgageInput = {
  balance: 300_000,
  annualRate: 0.065,
  entryMode: "term",
  currentPayment: 0,
  remainingYears: 25,
  remainingMonths: 0,
  start: PAYOFF_START,
  extraMonthly: 250,
  freedom: PAYOFF_START,
  timingAnnual: 0,
  lender: { annualLumpLimit: 0, maxMonthlyExtra: 0 },
};

const mortgage = resolveMortgage(EXTRA_VS_SAVINGS_INPUT);
const baseline = simulateAmortization(mortgage, [], "base", "Scheduled");
const extra = simulateAmortization(
  mortgage,
  [{ id: "extra-monthly", type: "monthly", amount: EXTRA_VS_SAVINGS_INPUT.extraMonthly, start: PAYOFF_START }],
  "extra",
  "+250",
);
const first = extra.months[0]!;

export const EXTRA_VS_SAVINGS_FIGURES = {
  balance: EXTRA_VS_SAVINGS_INPUT.balance,
  annualRate: EXTRA_VS_SAVINGS_INPUT.annualRate,
  remainingYears: EXTRA_VS_SAVINGS_INPUT.remainingYears,
  extraMonthly: EXTRA_VS_SAVINGS_INPUT.extraMonthly,
  scheduledPayment: mortgage.scheduledPayment,
  firstInterest: first.interest,
  firstScheduledPrincipal: first.scheduledPrincipal,
  firstExtra: first.extra,
  baselinePeriods: baseline.periods,
  extraPeriods: extra.periods,
  periodsSaved: calculateTimeReclaimed(
    baseline.payoffDate,
    extra.payoffDate,
    baseline.periods,
    extra.periods,
  ),
  baselineInterest: baseline.interestPaid,
  extraInterest: extra.interestPaid,
  interestAvoided: calculateInterestAvoided(baseline, extra),
};
