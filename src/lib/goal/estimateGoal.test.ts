import { describe, expect, it } from "vitest";
import { GOAL_DEFAULT } from "./defaults";
import { estimateGoal, mergeGoalInput, validateGoalInput } from "./estimateGoal";

describe("GOAL_DEFAULT", () => {
  it("starts with expenses above income so the first run can raid savings", () => {
    expect(GOAL_DEFAULT.annualExpenses).toBeGreaterThan(GOAL_DEFAULT.annualIncome);
    expect(GOAL_DEFAULT.goalSavings).toBeGreaterThan(0);
    expect(GOAL_DEFAULT.otherSavings).toBeGreaterThan(0);
  });
});

describe("estimateGoal", () => {
  it("dissolves or compromises the default tight plan", () => {
    const result = estimateGoal(GOAL_DEFAULT);
    expect(result.dippedOther).toBe(true);
    expect(result.dippedGoal).toBe(true);
    expect(["compromised", "dissolved"]).toContain(result.status);
    expect(result.intendedEndingGoal).toBeGreaterThan(result.endingGoal);
    expect(result.warnings.some((w) => w.includes("higher than income"))).toBe(true);
  });

  it("keeps the earmarked pot intact when income covers expenses and planned saving", () => {
    const result = estimateGoal({
      ...GOAL_DEFAULT,
      annualIncome: 90_000,
      annualExpenses: 60_000,
      goalSavings: 10_000,
      plannedAnnualToGoal: 5_000,
      yearsToGoal: 4,
      goalAmountToday: 20_000,
    });
    expect(result.dippedGoal).toBe(false);
    expect(result.dippedOther).toBe(false);
    expect(result.reachedGoal).toBe(true);
    expect(result.status).toBe("intact");
  });

  it("raids other savings first and can leave the goal pot intact", () => {
    const result = estimateGoal({
      ...GOAL_DEFAULT,
      annualIncome: 50_000,
      annualExpenses: 52_000,
      yearsToGoal: 2,
      otherSavings: 20_000,
      goalSavings: 15_000,
      plannedAnnualToGoal: 0,
      goalAmountToday: 12_000,
      inflationRate: 0,
      goalReturn: 0,
      otherReturn: 0,
    });
    expect(result.dippedOther).toBe(true);
    expect(result.dippedGoal).toBe(false);
    expect(result.endingGoal).toBe(15_000);
    expect(result.endingOther).toBe(16_000);
    expect(result.reachedGoal).toBe(true);
    expect(result.status).toBe("intact");
  });

  it("marks the pot dissolved when expenses wipe the earmarked savings", () => {
    const result = estimateGoal({
      ...GOAL_DEFAULT,
      annualIncome: 40_000,
      annualExpenses: 55_000,
      yearsToGoal: 3,
      otherSavings: 1_000,
      goalSavings: 8_000,
      plannedAnnualToGoal: 2_000,
      goalAmountToday: 25_000,
      inflationRate: 0,
      goalReturn: 0,
      otherReturn: 0,
    });
    expect(result.status).toBe("dissolved");
    expect(result.dippedGoal).toBe(true);
    expect(result.endingGoal).toBe(0);
    expect(result.yearGoalDepleted).not.toBeNull();
  });

  it("inflates the amount needed at the target year", () => {
    const flat = estimateGoal({ ...GOAL_DEFAULT, inflationRate: 0, annualIncome: 100_000, annualExpenses: 40_000 });
    const inflated = estimateGoal({ ...GOAL_DEFAULT, inflationRate: 0.05, annualIncome: 100_000, annualExpenses: 40_000 });
    expect(inflated.neededAtTarget).toBeGreaterThan(flat.neededAtTarget);
  });

  it("rejects a horizon outside 1–40 years", () => {
    expect(validateGoalInput(mergeGoalInput({ yearsToGoal: 0 })).some((e) => e.includes("Years until"))).toBe(true);
    expect(validateGoalInput(GOAL_DEFAULT)).toEqual([]);
  });
});
