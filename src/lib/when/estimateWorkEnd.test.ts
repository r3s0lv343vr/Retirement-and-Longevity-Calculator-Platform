import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT, nestEggNeededNow, planIsFunded } from "@/lib/engine";
import { WHEN_DEFAULT } from "./defaults";
import { estimateWorkEnd, inputAtWorkEnd } from "./estimateWorkEnd";

describe("WHEN_DEFAULT", () => {
  it("starts from the longevity defaults but leaves extras at zero", () => {
    expect(WHEN_DEFAULT.currentAge).toBe(DEFAULT_INPUT.currentAge);
    expect(WHEN_DEFAULT.lifestyleSpendToday).toBe(DEFAULT_INPUT.lifestyleSpendToday);
    expect(WHEN_DEFAULT.partTimeAnnualIncome).toBe(0);
    expect(WHEN_DEFAULT.longTermCareAnnual).toBe(0);
    expect(WHEN_DEFAULT.twoPerson).toBe(false);
  });
});

describe("estimateWorkEnd", () => {
  it("lets a large nest egg stop at the current age", () => {
    const result = estimateWorkEnd({ ...WHEN_DEFAULT, currentSavings: 4_000_000 });
    expect(result.cannotFund).toBe(false);
    expect(result.canStopNow).toBe(true);
    expect(result.workEndAge).toBe(WHEN_DEFAULT.currentAge);
    expect(result.yearsOfWork).toBe(0);
    expect(result.fundedThroughIfStopThen).toBe(WHEN_DEFAULT.planToAge);
  });

  it("asks for a later work-end when the nest egg is thinner", () => {
    const thin = estimateWorkEnd({ ...WHEN_DEFAULT, currentSavings: 150000, annualContribution: 0 });
    const large = estimateWorkEnd({ ...WHEN_DEFAULT, currentSavings: 4_000_000 });
    expect(thin.cannotFund).toBe(false);
    expect(thin.workEndAge).not.toBeNull();
    expect(thin.workEndAge as number).toBeGreaterThan(large.workEndAge as number);
    expect(thin.canStopNow).toBe(false);
  });

  it("solves for work-end, not for a larger nest egg", () => {
    const result = estimateWorkEnd({ ...WHEN_DEFAULT, currentSavings: 200000, annualContribution: 8000 });
    expect(result.solvedInput.currentSavings).toBe(200000);
    expect(result.workEndAge).not.toBeNull();
    expect(planIsFunded(result.solvedInput)).toBe(true);
    expect(nestEggNeededNow(result.solvedInput)).toBeLessThanOrEqual(200000);
  });

  it("needs a later work-end when lifestyle spend is higher", () => {
    const modest = estimateWorkEnd({
      ...WHEN_DEFAULT,
      currentSavings: 250000,
      annualContribution: 0,
      lifestyleSpendToday: 40000,
    });
    const high = estimateWorkEnd({
      ...WHEN_DEFAULT,
      currentSavings: 250000,
      annualContribution: 0,
      lifestyleSpendToday: 80000,
    });
    expect(modest.cannotFund).toBe(false);
    expect(modest.workEndAge).not.toBeNull();
    if (high.cannotFund) {
      expect(high.workEndAge).toBeNull();
    } else {
      expect(high.workEndAge as number).toBeGreaterThan(modest.workEndAge as number);
    }
  });

  it("reports that the plan cannot be funded by working longer inside the horizon", () => {
    const result = estimateWorkEnd({
      ...WHEN_DEFAULT,
      currentSavings: 1000,
      annualContribution: 0,
      lifestyleSpendToday: 120000,
      socialSecurityAnnual: 0,
      pensionAnnual: 0,
      healthcareSpendToday: 20000,
    });
    expect(result.cannotFund).toBe(true);
    expect(result.workEndAge).toBeNull();
    expect(result.canStopNow).toBe(false);
    expect(planIsFunded(inputAtWorkEnd(result.input, 90))).toBe(false);
  });

  it("uses the entered lifestyle, not the comfortable-living floor", () => {
    const entered = estimateWorkEnd({
      ...WHEN_DEFAULT,
      currentSavings: 300000,
      annualContribution: 0,
      lifestyleSpendToday: 40000,
    });
    expect(entered.input.lifestyleSpendToday).toBe(40000);
    expect(entered.solvedInput.lifestyleSpendToday).toBe(40000);
  });
});
