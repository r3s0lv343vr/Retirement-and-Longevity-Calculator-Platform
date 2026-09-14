import { addMonths, monthsBetween } from "./dates";
import { simulateAmortization } from "./amortization";
import { paymentFromBalanceRateTerm } from "./formulas";
import { money } from "./money";
import type { FreedomSolve, PaymentEvent, ResolvedMortgage } from "./types";

function monthlyEvent(mortgage: ResolvedMortgage, amount: number): PaymentEvent {
  return {
    id: "solve-monthly",
    type: "monthly",
    amount,
    start: mortgage.start,
  };
}

export function solvePaymentForTargetTerm(mortgage: ResolvedMortgage, targetPeriods: number): number {
  return money(paymentFromBalanceRateTerm(mortgage.balance, mortgage.periodicRate, Math.max(1, targetPeriods)));
}

export function solveExtraPaymentForTargetDate(
  mortgage: ResolvedMortgage,
  target: FreedomSolve["target"],
  otherEvents: PaymentEvent[] = [],
): FreedomSolve {
  const targetPeriods = monthsBetween(mortgage.start, target) + 1;
  if (targetPeriods < 1) {
    return {
      target,
      targetPeriods,
      possible: false,
      alreadyThere: false,
      extraMonthly: 0,
      totalPayment: mortgage.scheduledPayment,
      reason: "Pick a freedom date on or after the first payment month.",
    };
  }

  const baseline = simulateAmortization(mortgage, otherEvents, "solve-base", "Base");
  if (!baseline.neverPaysOff && baseline.periods <= targetPeriods) {
    return {
      target,
      targetPeriods,
      possible: true,
      alreadyThere: true,
      extraMonthly: 0,
      totalPayment: mortgage.scheduledPayment,
      reason: "The current path is already mortgage-free by that date.",
    };
  }

  const periodsFor = (extra: number) =>
    simulateAmortization(mortgage, [...otherEvents, monthlyEvent(mortgage, extra)], "solve", "Solve").periods;

  if (otherEvents.length === 0) {
    const requiredPayment = solvePaymentForTargetTerm(mortgage, targetPeriods);
    const closed = money(Math.max(0, requiredPayment - mortgage.scheduledPayment));
    const closedPeriods = periodsFor(closed);
    if (closedPeriods <= targetPeriods) {
      return {
        target,
        targetPeriods,
        possible: true,
        alreadyThere: false,
        extraMonthly: closed,
        totalPayment: money(mortgage.scheduledPayment + closed),
        reason: null,
      };
    }
  }

  let lo = 0;
  let hi = Math.max(mortgage.balance, 1);
  const high = simulateAmortization(mortgage, [...otherEvents, monthlyEvent(mortgage, hi)], "solve-hi", "High");
  if (high.neverPaysOff || high.periods > targetPeriods) {
    return {
      target,
      targetPeriods,
      possible: false,
      alreadyThere: false,
      extraMonthly: 0,
      totalPayment: mortgage.scheduledPayment,
      reason: "That date is too soon even if extra principal is very large.",
    };
  }

  for (let i = 0; i < 40; i += 1) {
    const mid = (lo + hi) / 2;
    if (periodsFor(mid) <= targetPeriods) hi = mid;
    else lo = mid;
  }

  const extraMonthly = money(hi);
  return {
    target,
    targetPeriods,
    possible: true,
    alreadyThere: extraMonthly <= 0,
    extraMonthly,
    totalPayment: money(mortgage.scheduledPayment + extraMonthly),
    reason: null,
  };
}

export function payoffDateAfterPeriods(mortgage: ResolvedMortgage, periods: number) {
  return addMonths(mortgage.start, Math.max(1, periods) - 1);
}
