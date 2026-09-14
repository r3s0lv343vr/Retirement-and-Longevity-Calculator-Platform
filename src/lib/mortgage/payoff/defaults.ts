import { addMonths, makeYearMonth } from "./dates";
import { asNumber } from "./money";
import type { LenderRules, PayoffMortgageInput, PaymentEvent, Scenario } from "./types";

export const PAYOFF_START = makeYearMonth(2026, 10);

export const PAYOFF_DEFAULT: PayoffMortgageInput = {
  balance: 340_000,
  annualRate: 0.065,
  entryMode: "term",
  currentPayment: 0,
  remainingYears: 30,
  remainingMonths: 0,
  start: PAYOFF_START,
  extraMonthly: 0,
  freedom: addMonths(PAYOFF_START, 15 * 12),
  timingAnnual: 3_000,
  lender: {
    annualLumpLimit: 0,
    maxMonthlyExtra: 0,
  },
};

export function mergeLender(raw: Partial<LenderRules> | undefined): LenderRules {
  return {
    annualLumpLimit: asNumber(raw?.annualLumpLimit, PAYOFF_DEFAULT.lender.annualLumpLimit),
    maxMonthlyExtra: asNumber(raw?.maxMonthlyExtra, PAYOFF_DEFAULT.lender.maxMonthlyExtra),
  };
}

export function mergePayoffInput(raw?: Partial<PayoffMortgageInput> | null): PayoffMortgageInput {
  const src = raw ?? {};
  const start = src.start
    ? makeYearMonth(asNumber(src.start.year, PAYOFF_DEFAULT.start.year), asNumber(src.start.month, PAYOFF_DEFAULT.start.month))
    : PAYOFF_DEFAULT.start;
  const freedom = src.freedom
    ? makeYearMonth(asNumber(src.freedom.year, PAYOFF_DEFAULT.freedom.year), asNumber(src.freedom.month, PAYOFF_DEFAULT.freedom.month))
    : PAYOFF_DEFAULT.freedom;
  const entryMode = src.entryMode === "payment" ? "payment" : "term";
  return {
    balance: asNumber(src.balance, PAYOFF_DEFAULT.balance),
    annualRate: asNumber(src.annualRate, PAYOFF_DEFAULT.annualRate),
    entryMode,
    currentPayment: asNumber(src.currentPayment, PAYOFF_DEFAULT.currentPayment),
    remainingYears: asNumber(src.remainingYears, PAYOFF_DEFAULT.remainingYears),
    remainingMonths: asNumber(src.remainingMonths, PAYOFF_DEFAULT.remainingMonths),
    start,
    extraMonthly: asNumber(src.extraMonthly, PAYOFF_DEFAULT.extraMonthly),
    freedom,
    timingAnnual: asNumber(src.timingAnnual, PAYOFF_DEFAULT.timingAnnual),
    lender: mergeLender(src.lender),
  };
}

export function emptyEvent(partial: Partial<PaymentEvent> & Pick<PaymentEvent, "type">): PaymentEvent {
  return {
    id: partial.id ?? `${partial.type}-${Math.random().toString(36).slice(2, 7)}`,
    type: partial.type,
    amount: asNumber(partial.amount, 0),
    start: partial.start ?? PAYOFF_START,
    end: partial.end,
    calendarMonth: partial.calendarMonth,
    annualIncrease: partial.annualIncrease,
    cadence: partial.cadence,
  };
}

export function defaultStrategies(): Scenario[] {
  return [
    {
      id: "plan-a",
      name: "Plan A",
      events: [
        emptyEvent({
          id: "plan-a-monthly",
          type: "monthly",
          amount: 250,
          start: PAYOFF_START,
        }),
      ],
    },
    {
      id: "plan-b",
      name: "Plan B",
      events: [
        emptyEvent({
          id: "plan-b-monthly",
          type: "monthly",
          amount: 150,
          start: PAYOFF_START,
        }),
        emptyEvent({
          id: "plan-b-annual",
          type: "annual",
          amount: 3_000,
          start: PAYOFF_START,
          calendarMonth: 12,
        }),
      ],
    },
    {
      id: "plan-c",
      name: "Plan C",
      events: [
        emptyEvent({
          id: "plan-c-temp",
          type: "temporary",
          amount: 500,
          start: PAYOFF_START,
          end: addMonths(PAYOFF_START, 5 * 12 - 1),
        }),
      ],
    },
  ];
}
