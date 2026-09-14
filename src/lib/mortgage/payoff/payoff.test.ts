import { describe, expect, it } from "vitest";
import { addMonths, makeYearMonth, monthsBetween } from "./dates";
import { PAYOFF_DEFAULT, PAYOFF_START, defaultStrategies, mergePayoffInput } from "./defaults";
import { extraForPeriod, paycheckCountInMonth } from "./events";
import { paymentFromBalanceRateTerm, remainingTermFromBalanceRatePayment } from "./formulas";
import { simulateAmortization } from "./amortization";
import { resolveMortgage } from "./resolve";
import { solveExtraPaymentForTargetDate, solvePaymentForTargetTerm } from "./solver";
import { parseStoredPayoffPlan } from "./storage";
import { runPayoffStudio } from "./studio";
import { validatePayoffInput } from "./validation";
import type { PaymentEvent } from "./types";

function mortgageAt(
  balance: number,
  annualRate: number,
  years: number,
  start = makeYearMonth(2026, 1),
) {
  return resolveMortgage(
    mergePayoffInput({
      balance,
      annualRate,
      entryMode: "term",
      remainingYears: years,
      remainingMonths: 0,
      start,
    }),
  );
}

describe("payoff formulas", () => {
  it("matches known 15-, 20-, 25-, and 30-year fixed payments", () => {
    expect(paymentFromBalanceRateTerm(200_000, 0.06 / 12, 360)).toBeCloseTo(1199.1, 1);
    expect(paymentFromBalanceRateTerm(400_000, 0.06 / 12, 360)).toBeCloseTo(2398.2, 1);
    expect(paymentFromBalanceRateTerm(300_000, 0.04 / 12, 180)).toBeCloseTo(2219.06, 1);
    expect(paymentFromBalanceRateTerm(250_000, 0.05 / 12, 240)).toBeCloseTo(1649.89, 1);
    expect(paymentFromBalanceRateTerm(350_000, 0.065 / 12, 300)).toBeCloseTo(2363.23, 1);
  });

  it("inverts payment back to remaining term", () => {
    const payment = paymentFromBalanceRateTerm(400_000, 0.06 / 12, 360);
    expect(remainingTermFromBalanceRatePayment(400_000, 0.06 / 12, payment)).toBe(360);
  });

  it("handles zero interest and a one-period payoff", () => {
    expect(paymentFromBalanceRateTerm(120_000, 0, 120)).toBeCloseTo(1000, 6);
    expect(remainingTermFromBalanceRatePayment(120_000, 0, 1000)).toBe(120);
    expect(paymentFromBalanceRateTerm(5_000, 0.05 / 12, 1)).toBeCloseTo(5020.83, 1);
  });

  it("returns null when the payment never covers interest", () => {
    expect(remainingTermFromBalanceRatePayment(400_000, 0.06 / 12, 100)).toBeNull();
  });
});

describe("amortization engine", () => {
  it("pays a standard 30-year loan in 360 months and never goes negative", () => {
    const loan = mortgageAt(400_000, 0.06, 30);
    const result = simulateAmortization(loan, [], "base", "Baseline");
    expect(result.periods).toBe(360);
    expect(result.neverPaysOff).toBe(false);
    expect(result.months.at(-1)?.endingBalance).toBe(0);
    expect(result.months.every((row) => row.endingBalance >= -0.005)).toBe(true);
    expect(result.interestPaid).toBeGreaterThan(400_000);
    expect(result.milestones.some((row) => row.id === "final")).toBe(true);
    expect(result.milestones.some((row) => row.id === "50")).toBe(true);
  });

  it("applies two extras in the same first period", () => {
    const loan = mortgageAt(200_000, 0.06, 30);
    const events: PaymentEvent[] = [
      { id: "m", type: "monthly", amount: 100, start: loan.start },
      { id: "l", type: "lumpSum", amount: 1_000, start: loan.start },
    ];
    const result = simulateAmortization(loan, events, "mix", "Mix");
    expect(result.months[0]?.extra).toBeCloseTo(1_100, 2);
    expect(result.periods).toBeLessThan(360);
  });

  it("honors a delayed start, a temporary window, and a pause year", () => {
    const loan = mortgageAt(200_000, 0.06, 30, makeYearMonth(2026, 1));
    const delayed: PaymentEvent[] = [
      { id: "d", type: "monthly", amount: 300, start: makeYearMonth(2027, 1) },
    ];
    const delayedRun = simulateAmortization(loan, delayed, "d", "Delayed");
    expect(delayedRun.months[0]?.extra).toBe(0);
    expect(delayedRun.months[12]?.extra).toBeCloseTo(300, 2);

    const temp: PaymentEvent[] = [
      {
        id: "t",
        type: "temporary",
        amount: 400,
        start: makeYearMonth(2026, 1),
        end: makeYearMonth(2027, 12),
      },
    ];
    const tempRun = simulateAmortization(loan, temp, "t", "Temp");
    expect(tempRun.months[0]?.extra).toBeCloseTo(400, 2);
    expect(tempRun.months[24]?.extra).toBe(0);

    const pause: PaymentEvent[] = [
      { id: "m", type: "monthly", amount: 250, start: loan.start },
      { id: "p", type: "pause", amount: 0, start: makeYearMonth(2030, 1), end: makeYearMonth(2030, 12) },
    ];
    const pauseRun = simulateAmortization(loan, pause, "p", "Pause");
    const paused = pauseRun.months.find((row) => row.date.year === 2030 && row.date.month === 6);
    const after = pauseRun.months.find((row) => row.date.year === 2031 && row.date.month === 1);
    expect(paused?.extra).toBe(0);
    expect(after?.extra).toBeCloseTo(250, 2);
  });

  it("caps the last extra so the balance does not go negative", () => {
    const loan = mortgageAt(10_000, 0, 12);
    const events: PaymentEvent[] = [{ id: "l", type: "lumpSum", amount: 50_000, start: loan.start }];
    const result = simulateAmortization(loan, events, "cap", "Cap");
    expect(result.periods).toBe(1);
    expect(result.months[0]?.endingBalance).toBe(0);
    expect(result.months[0]?.extra).toBeLessThanOrEqual(10_000);
  });
});

describe("paycheck conversion", () => {
  it("counts weekly, biweekly, and semimonthly paydays from the first of the start month", () => {
    const jan = makeYearMonth(2026, 1);
    expect(paycheckCountInMonth("semimonthly", jan, jan)).toBe(2);
    expect(paycheckCountInMonth("weekly", jan, jan)).toBe(5);
    expect(paycheckCountInMonth("biweekly", jan, jan)).toBe(3);
    const feb = makeYearMonth(2026, 2);
    expect(paycheckCountInMonth("weekly", feb, jan)).toBe(4);
    expect(paycheckCountInMonth("biweekly", feb, jan)).toBe(2);
  });

  it("applies 26 biweekly extras over a year instead of a 12-month approximation", () => {
    const loan = mortgageAt(200_000, 0.06, 30, makeYearMonth(2026, 1));
    const events: PaymentEvent[] = [
      { id: "bw", type: "paycheck", amount: 100, start: loan.start, cadence: "biweekly" },
    ];
    const firstYear = simulateAmortization(loan, events, "bw", "Biweekly").months.filter((row) => row.date.year === 2026);
    const extras = firstYear.reduce((sum, row) => sum + Math.round(row.extra / 100), 0);
    // 2026 from Jan 1 is 365 days, so a 14-day series includes 27 paydays, not a flat 26.
    expect(extras).toBe(27);
    expect(firstYear.some((row) => row.extra === 300)).toBe(true);
    expect(firstYear.some((row) => row.extra === 200)).toBe(true);
  });
});

describe("target-date solver", () => {
  it("uses the closed-form extra when there are no other events", () => {
    const loan = mortgageAt(300_000, 0.05, 30);
    const target = addMonths(loan.start, 20 * 12 - 1);
    const solved = solveExtraPaymentForTargetDate(loan, target);
    expect(solved.possible).toBe(true);
    expect(solved.extraMonthly).toBeGreaterThan(0);
    const check = simulateAmortization(
      loan,
      [{ id: "x", type: "monthly", amount: solved.extraMonthly, start: loan.start }],
      "x",
      "X",
    );
    expect(check.periods).toBeLessThanOrEqual(20 * 12);
    expect(check.periods).toBeGreaterThan(20 * 12 - 2);
  });

  it("rejects a date before the first payment and reports an already-there goal", () => {
    const loan = mortgageAt(200_000, 0.04, 15);
    const before = addMonths(loan.start, -2);
    expect(solveExtraPaymentForTargetDate(loan, before).possible).toBe(false);
    const afterNatural = addMonths(loan.naturalPayoff, 12);
    const already = solveExtraPaymentForTargetDate(loan, afterNatural);
    expect(already.possible).toBe(true);
    expect(already.alreadyThere).toBe(true);
    expect(already.extraMonthly).toBe(0);
  });

  it("solves a target term payment", () => {
    const loan = mortgageAt(250_000, 0.05, 30);
    const payment = solvePaymentForTargetTerm(loan, 180);
    expect(payment).toBeCloseTo(paymentFromBalanceRateTerm(250_000, 0.05 / 12, 180), 2);
  });
});

describe("studio insights", () => {
  it("ranks baseline plus quick extra plus three strategies", () => {
    const input = mergePayoffInput({ extraMonthly: 200, timingAnnual: 3_000 });
    const studio = runPayoffStudio(input, defaultStrategies(), "plan-a");
    expect(studio.comparison).toHaveLength(5);
    expect(studio.baseline.periods).toBe(360);
    expect(studio.quick.periods).toBeLessThan(studio.baseline.periods);
    expect(studio.timing).toHaveLength(4);
    expect(studio.temporary.map((row) => row.years)).toEqual([2, 5, 10]);
    expect(studio.freedom.possible).toBe(true);
    expect(studio.feasible.some((row) => row.isRequired)).toBe(true);
    expect(new Set(studio.timing.map((row) => row.result.interestPaid)).size).toBeGreaterThan(1);
    expect(studio.rankings.earliestId).toBeTruthy();
  });

  it("saves more interest when the same annual cash hits earlier in a January-start loan", () => {
    const input = mergePayoffInput({
      start: makeYearMonth(2026, 1),
      freedom: makeYearMonth(2041, 1),
      timingAnnual: 3_000,
    });
    const studio = runPayoffStudio(input, []);
    const monthly = studio.timing.find((row) => row.id === "timing-monthly");
    const early = studio.timing.find((row) => row.id === "timing-early");
    const late = studio.timing.find((row) => row.id === "timing-late");
    expect(monthly && early && late).toBeTruthy();
    expect(early!.interestAvoided).toBeGreaterThan(late!.interestAvoided);
    expect(monthly!.interestAvoided).toBeGreaterThan(late!.interestAvoided);
  });

  it("flags extras above a stated lender cap", () => {
    const input = mergePayoffInput({
      lender: { annualLumpLimit: 1_000, maxMonthlyExtra: 100 },
    });
    const studio = runPayoffStudio(input, defaultStrategies());
    const planA = studio.comparison.find((row) => row.id === "plan-a");
    expect(planA?.ruleFlags.some((row) => row.includes("monthly extra cap"))).toBe(true);
    const planB = studio.comparison.find((row) => row.id === "plan-b");
    expect(planB?.ruleFlags.some((row) => row.includes("annual lump-sum"))).toBe(true);
  });
});

describe("validation and local storage schema", () => {
  it("rejects a zero balance and a payment that is not entered", () => {
    expect(validatePayoffInput(mergePayoffInput({ balance: 0 })).length).toBeGreaterThan(0);
    expect(validatePayoffInput(mergePayoffInput({ entryMode: "payment", currentPayment: 0 })).length).toBeGreaterThan(0);
    expect(validatePayoffInput(PAYOFF_DEFAULT)).toEqual([]);
  });

  it("drops an unknown storage version and keeps a v1 plan", () => {
    expect(parseStoredPayoffPlan({ version: 9, input: PAYOFF_DEFAULT })).toBeNull();
    const parsed = parseStoredPayoffPlan({
      version: 1,
      savedAt: "2026-09-14T00:00:00.000Z",
      input: { balance: 180_000, annualRate: 0.05, extraMonthly: 125 },
      strategies: defaultStrategies(),
      selectedId: "plan-b",
    });
    expect(parsed?.input.balance).toBe(180_000);
    expect(parsed?.selectedId).toBe("plan-b");
    expect(parsed?.strategies).toHaveLength(3);
  });
});

describe("dates", () => {
  it("adds months across a year boundary", () => {
    expect(addMonths(PAYOFF_START, 3)).toEqual({ year: 2027, month: 1 });
    expect(monthsBetween(PAYOFF_START, makeYearMonth(2027, 10))).toBe(12);
  });
});

describe("extra stacking", () => {
  it("sums monthly and annual extras in December and ignores them inside a pause", () => {
    const december = makeYearMonth(2026, 12);
    const events: PaymentEvent[] = [
      { id: "m", type: "monthly", amount: 200, start: makeYearMonth(2026, 10) },
      { id: "a", type: "annual", amount: 3_000, start: makeYearMonth(2026, 10), calendarMonth: 12 },
    ];
    expect(extraForPeriod(events, december)).toBeCloseTo(3_200, 2);
    expect(
      extraForPeriod(
        [...events, { id: "p", type: "pause", amount: 0, start: december, end: december }],
        december,
      ),
    ).toBe(0);
  });
});
