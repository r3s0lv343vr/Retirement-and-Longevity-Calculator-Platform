import { addMonths, type YearMonth } from "./dates";
import { extraForPeriod } from "./events";
import { interestForPeriod } from "./formulas";
import { money } from "./money";
import type { Milestone, MonthRow, PaymentEvent, ResolvedMortgage, SimulationResult, YearRow } from "./types";

export const MAX_PAYOFF_PERIODS = 600;

export function rollupYears(months: MonthRow[]): YearRow[] {
  const byYear = new Map<number, YearRow>();
  for (const row of months) {
    const current = byYear.get(row.date.year) ?? {
      calendarYear: row.date.year,
      interest: 0,
      scheduledPrincipal: 0,
      extra: 0,
      principal: 0,
      endingBalance: row.endingBalance,
    };
    current.interest = money(current.interest + row.interest);
    current.scheduledPrincipal = money(current.scheduledPrincipal + row.scheduledPrincipal);
    current.extra = money(current.extra + row.extra);
    current.principal = money(current.principal + row.principal);
    current.endingBalance = row.endingBalance;
    byYear.set(row.date.year, current);
  }
  return [...byYear.values()];
}

export function calculateMilestones(originalBalance: number, months: MonthRow[]): Milestone[] {
  if (months.length === 0) return [];
  const thresholds: { id: string; label: string; ratio: number }[] = [
    { id: "75", label: "Balance at 75% of the starting loan", ratio: 0.75 },
    { id: "50", label: "Halfway — 50% of the starting principal is gone", ratio: 0.5 },
    { id: "25", label: "Balance at 25% of the starting loan", ratio: 0.25 },
    { id: "10", label: "Balance at 10% of the starting loan", ratio: 0.1 },
  ];
  const found: Milestone[] = [];
  for (const threshold of thresholds) {
    const row = months.find((month) => month.endingBalance <= originalBalance * threshold.ratio + 0.005);
    if (!row) continue;
    found.push({
      id: threshold.id,
      label: threshold.label,
      date: row.date,
      period: row.period,
      balance: row.endingBalance,
    });
  }
  const last = months[months.length - 1];
  if (last && last.endingBalance <= 0.005) {
    found.push({
      id: "final",
      label: "Final payment",
      date: last.date,
      period: last.period,
      balance: last.endingBalance,
    });
  }
  return found;
}

export function simulateAmortization(
  mortgage: ResolvedMortgage,
  events: PaymentEvent[],
  id = "sim",
  name = "Scenario",
): SimulationResult {
  const months: MonthRow[] = [];
  let balance = money(mortgage.balance);
  let interestPaid = 0;
  let extraPaid = 0;
  let scheduledPaid = 0;
  const payment = mortgage.scheduledPayment;
  const rate = mortgage.periodicRate;

  for (let i = 0; i < MAX_PAYOFF_PERIODS && balance > 0.005; i += 1) {
    const date = addMonths(mortgage.start, i);
    const interest = interestForPeriod(balance, rate);
    const extraRequested = extraForPeriod(events, date);
    const due = money(balance + interest);
    const available = money(payment + extraRequested);
    const lastScheduled = i + 1 >= mortgage.remainingPeriods;
    let scheduledPrincipal = money(Math.min(Math.max(0, payment - interest), balance));
    let extra = money(Math.min(extraRequested, Math.max(0, balance - scheduledPrincipal)));
    let endingBalance = money(Math.max(0, balance - scheduledPrincipal - extra));
    if (due <= available || (lastScheduled && endingBalance > 0 && endingBalance <= payment)) {
      scheduledPrincipal = money(Math.min(balance, Math.max(0, payment - interest)));
      extra = money(Math.max(0, balance - scheduledPrincipal));
      endingBalance = 0;
    } else if (endingBalance > 0 && endingBalance <= 0.05) {
      extra = money(extra + endingBalance);
      endingBalance = 0;
    }
    const principal = money(scheduledPrincipal + extra);
    const periodPayment = money(scheduledPrincipal + extra + interest);

    months.push({
      period: i + 1,
      date,
      interest,
      scheduledPrincipal,
      extra,
      principal,
      payment: periodPayment,
      endingBalance,
    });

    interestPaid = money(interestPaid + interest);
    extraPaid = money(extraPaid + extra);
    scheduledPaid = money(scheduledPaid + scheduledPrincipal + interest);
    balance = endingBalance;
  }

  const neverPaysOff = balance > 0.005;
  const last = months[months.length - 1];
  return {
    id,
    name,
    payoffDate: neverPaysOff ? null : (last?.date ?? null),
    periods: months.length,
    interestPaid,
    extraPaid,
    scheduledPaid,
    neverPaysOff,
    months,
    years: rollupYears(months),
    milestones: calculateMilestones(mortgage.balance, months),
  };
}

export function calculateInterestAvoided(baseline: SimulationResult, scenario: SimulationResult): number {
  return money(Math.max(0, baseline.interestPaid - scenario.interestPaid));
}

export function calculateTimeReclaimed(
  baselinePayoff: YearMonth | null,
  scenarioPayoff: YearMonth | null,
  baselinePeriods: number,
  scenarioPeriods: number,
): number {
  if (!baselinePayoff || !scenarioPayoff) return Math.max(0, baselinePeriods - scenarioPeriods);
  return Math.max(0, baselinePeriods - scenarioPeriods);
}
