import { addMonths } from "./dates";
import {
  calculateInterestAvoided,
  calculateTimeReclaimed,
  simulateAmortization,
} from "./amortization";
import { extraForPeriod, newEventId, recurringMonthlyFromEvents } from "./events";
import { flagsForEvents } from "./lender";
import { money } from "./money";
import { resolveMortgage } from "./resolve";
import { solveExtraPaymentForTargetDate } from "./solver";
import type {
  ComparisonRow,
  FeasiblePath,
  FreedomSolve,
  PayoffMortgageInput,
  PaymentEvent,
  ResolvedMortgage,
  Scenario,
  SimulationResult,
  TemporaryRow,
  TimingRow,
} from "./types";

export type PayoffStudio = {
  errors: string[];
  mortgage: ResolvedMortgage;
  baseline: SimulationResult;
  quick: SimulationResult;
  strategies: { scenario: Scenario; result: SimulationResult }[];
  comparison: ComparisonRow[];
  rankings: {
    earliestId: string | null;
    lowestInterestId: string | null;
    lowestRecurringId: string | null;
  };
  freedom: FreedomSolve;
  feasible: FeasiblePath[];
  timing: TimingRow[];
  temporary: TemporaryRow[];
  selected: SimulationResult;
};

function quickEvents(input: PayoffMortgageInput): PaymentEvent[] {
  if (input.extraMonthly <= 0) return [];
  return [
    {
      id: "quick-monthly",
      type: "monthly",
      amount: input.extraMonthly,
      start: input.start,
    },
  ];
}

function comparisonRow(
  result: SimulationResult,
  baseline: SimulationResult,
  events: PaymentEvent[],
  mortgage: ResolvedMortgage,
  rules: PayoffMortgageInput["lender"],
): ComparisonRow {
  const flags = flagsForEvents(result.id, events, rules, mortgage);
  return {
    id: result.id,
    name: result.name,
    payoffDate: result.payoffDate,
    periods: result.periods,
    periodsSaved: calculateTimeReclaimed(baseline.payoffDate, result.payoffDate, baseline.periods, result.periods),
    interestPaid: result.interestPaid,
    interestAvoided: calculateInterestAvoided(baseline, result),
    extraPaid: result.extraPaid,
    recurringMonthly: recurringMonthlyFromEvents(events),
    neverPaysOff: result.neverPaysOff,
    ruleFlags: flags.map((flag) => flag.message),
  };
}

function feasiblePaths(mortgage: ResolvedMortgage, baseline: SimulationResult, requiredExtra: number): FeasiblePath[] {
  const extras = new Set<number>();
  extras.add(0);
  if (requiredExtra > 0) {
    extras.add(money(requiredExtra * 0.25));
    extras.add(money(requiredExtra * 0.5));
    extras.add(money(requiredExtra * 0.75));
    extras.add(money(requiredExtra));
  }
  for (const preset of [100, 250, 500]) extras.add(preset);
  return [...extras]
    .filter((amount) => amount >= 0)
    .sort((a, b) => a - b)
    .map((extraMonthly) => {
      const events: PaymentEvent[] =
        extraMonthly > 0
          ? [{ id: `feas-${extraMonthly}`, type: "monthly", amount: extraMonthly, start: mortgage.start }]
          : [];
      const result = simulateAmortization(mortgage, events, `feas-${extraMonthly}`, `+${extraMonthly}`);
      return {
        extraMonthly,
        payoffDate: result.payoffDate,
        periodsSaved: calculateTimeReclaimed(baseline.payoffDate, result.payoffDate, baseline.periods, result.periods),
        interestAvoided: calculateInterestAvoided(baseline, result),
        isRequired: requiredExtra > 0 && Math.abs(extraMonthly - requiredExtra) < 0.02,
      };
    });
}

function timingLab(mortgage: ResolvedMortgage, baseline: SimulationResult, annual: number): TimingRow[] {
  const cash = money(Math.max(0, annual));
  if (cash <= 0) return [];
  const start = mortgage.start;
  const monthly = money(cash / 12);
  const quarterly = money(cash / 4);
  const specs: { id: string; name: string; note: string; events: PaymentEvent[] }[] = [
    {
      id: "timing-monthly",
      name: "Monthly",
      note: `${cash.toFixed(0)} a year as ${monthly.toFixed(2)} every month.`,
      events: [{ id: "t-m", type: "monthly", amount: monthly, start }],
    },
    {
      id: "timing-quarterly",
      name: "Quarterly",
      note: `${quarterly.toFixed(0)} in the first month of each quarter.`,
      events: [1, 4, 7, 10].map((month) => ({
        id: `t-q-${month}`,
        type: "annual",
        amount: quarterly,
        start,
        calendarMonth: month,
      })),
    },
    {
      id: "timing-early",
      name: "Early-year",
      note: `The whole ${cash.toFixed(0)} in January.`,
      events: [{ id: "t-e", type: "annual", amount: cash, start, calendarMonth: 1 }],
    },
    {
      id: "timing-late",
      name: "Late-year",
      note: `The whole ${cash.toFixed(0)} in December.`,
      events: [{ id: "t-l", type: "annual", amount: cash, start, calendarMonth: 12 }],
    },
  ];

  return specs.map((spec) => {
    const result = simulateAmortization(mortgage, spec.events, spec.id, spec.name);
    return {
      id: spec.id,
      name: spec.name,
      note: spec.note,
      result,
      interestAvoided: calculateInterestAvoided(baseline, result),
      periodsSaved: calculateTimeReclaimed(baseline.payoffDate, result.payoffDate, baseline.periods, result.periods),
    };
  });
}

function temporaryRows(
  mortgage: ResolvedMortgage,
  baseline: SimulationResult,
  extraMonthly: number,
): TemporaryRow[] {
  const amount = extraMonthly > 0 ? extraMonthly : 250;
  return [2, 5, 10].map((years) => {
    const events: PaymentEvent[] = [
      {
        id: `temp-${years}`,
        type: "temporary",
        amount,
        start: mortgage.start,
        end: addMonths(mortgage.start, years * 12 - 1),
      },
    ];
    const result = simulateAmortization(mortgage, events, `temp-${years}`, `+${amount} for ${years} years`);
    return {
      years,
      result,
      interestAvoided: calculateInterestAvoided(baseline, result),
      periodsSaved: calculateTimeReclaimed(baseline.payoffDate, result.payoffDate, baseline.periods, result.periods),
    };
  });
}

export function extraAppliedInPeriod(events: PaymentEvent[], date: Parameters<typeof extraForPeriod>[1]): number {
  return extraForPeriod(events, date);
}

export function runPayoffStudio(input: PayoffMortgageInput, strategies: Scenario[], selectedId?: string): PayoffStudio {
  const mortgage = resolveMortgage(input);
  const baseline = simulateAmortization(mortgage, [], "baseline", "Baseline");
  const quick = simulateAmortization(mortgage, quickEvents(input), "quick", "Quick extra");
  const strategyRuns = strategies.slice(0, 4).map((scenario) => ({
    scenario,
    result: simulateAmortization(mortgage, scenario.events, scenario.id, scenario.name),
  }));

  const comparison = [
    comparisonRow(baseline, baseline, [], mortgage, input.lender),
    comparisonRow(quick, baseline, quickEvents(input), mortgage, input.lender),
    ...strategyRuns.map((run) => comparisonRow(run.result, baseline, run.scenario.events, mortgage, input.lender)),
  ];

  const payable = comparison.filter((row) => row.id !== "baseline" && !row.neverPaysOff);
  const earliest = payable.reduce<ComparisonRow | null>(
    (best, row) => (!best || row.periods < best.periods ? row : best),
    null,
  );
  const lowestInterest = payable.reduce<ComparisonRow | null>(
    (best, row) => (!best || row.interestPaid < best.interestPaid ? row : best),
    null,
  );
  const withRecurring = payable.filter((row) => row.recurringMonthly > 0);
  const lowestRecurring = (withRecurring.length ? withRecurring : payable).reduce<ComparisonRow | null>(
    (best, row) => (!best || row.recurringMonthly < best.recurringMonthly ? row : best),
    null,
  );

  const freedom = solveExtraPaymentForTargetDate(mortgage, input.freedom);
  const selected =
    strategyRuns.find((run) => run.scenario.id === selectedId)?.result ??
    (input.extraMonthly > 0 ? quick : strategyRuns[0]?.result ?? quick);

  return {
    errors: [],
    mortgage,
    baseline,
    quick,
    strategies: strategyRuns,
    comparison,
    rankings: {
      earliestId: earliest?.id ?? null,
      lowestInterestId: lowestInterest?.id ?? null,
      lowestRecurringId: lowestRecurring?.id ?? null,
    },
    freedom,
    feasible: feasiblePaths(mortgage, baseline, freedom.possible ? freedom.extraMonthly : 0),
    timing: timingLab(mortgage, baseline, input.timingAnnual),
    temporary: temporaryRows(mortgage, baseline, input.extraMonthly),
    selected,
  };
}

export function cloneEvent(event: PaymentEvent): PaymentEvent {
  return { ...event, id: newEventId(event.type), start: { ...event.start }, end: event.end ? { ...event.end } : undefined };
}
