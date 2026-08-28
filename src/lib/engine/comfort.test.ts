import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT } from "./defaults";
import { COMFORT_LIFESTYLE_FLOOR, comfortInputFrom, estimateComfort, extraAnnualSavings } from "./comfort";

describe("comfortInputFrom", () => {
  it("raises low lifestyle spend to a comfortable floor plus buffer", () => {
    const next = comfortInputFrom({ ...DEFAULT_INPUT, lifestyleSpendToday: 40000 });
    expect(next.lifestyleSpendToday).toBeCloseTo(COMFORT_LIFESTYLE_FLOOR * 1.1);
  });

  it("keeps a higher entered lifestyle and adds a buffer", () => {
    const next = comfortInputFrom({ ...DEFAULT_INPUT, lifestyleSpendToday: 90000 });
    expect(next.lifestyleSpendToday).toBeCloseTo(99000);
  });

  it("does not invent facility rent when housing was left at zero", () => {
    const next = comfortInputFrom({
      ...DEFAULT_INPUT,
      seniorHomeRentAnnual: 0,
      nursingHomeRentAnnual: 0,
      ccrcRentAnnual: 0,
    });
    expect(next.seniorHomeRentAnnual).toBe(0);
    expect(next.nursingHomeRentAnnual).toBe(0);
    expect(next.ccrcRentAnnual).toBe(0);
  });
});

describe("extraAnnualSavings", () => {
  it("returns zero when there is no gap", () => {
    expect(extraAnnualSavings(0, 10, 0.07)).toBe(0);
  });

  it("splits a gap evenly when the return is zero", () => {
    expect(extraAnnualSavings(10000, 5, 0)).toBe(2000);
  });
});

describe("estimateComfort", () => {
  it("asks for more nest egg on a thin plan than on a large one", () => {
    const thin = estimateComfort({ ...DEFAULT_INPUT, currentSavings: 150000, annualContribution: 0 });
    const large = estimateComfort({ ...DEFAULT_INPUT, currentSavings: 4_000_000 });
    expect(thin.additionalNestEgg).toBeGreaterThan(large.additionalNestEgg);
    expect(large.additionalNestEgg).toBe(0);
    expect(thin.suggestedAnnualBudgetToday).toBeGreaterThan(DEFAULT_INPUT.healthcareSpendToday);
  });

  it("does not ask a 41-year-old for $50k extra a year when the plan already lasts into the 90s", () => {
    const comfort = estimateComfort({
      ...DEFAULT_INPUT,
      currentAge: 41,
      retirementAge: 65,
      planToAge: 95,
      currentSavings: 71000,
      annualContribution: 13000,
      partTimeAnnualIncome: 16000,
      partTimeStartAge: 65,
      partTimeEndAge: 75,
      socialSecurityAnnual: 28800,
      socialSecurityStartAge: 67,
      pensionAnnual: 36000,
      pensionStartAge: 65,
      lifestyleSpendToday: 62000,
      healthcareSpendToday: 8400,
      longTermCareAnnual: 18000,
      seniorHomeRentAnnual: 0,
      nursingHomeRentAnnual: 0,
      ccrcRentAnnual: 0,
    });
    expect(comfort.usedHousingPlaceholder).toBe(false);
    expect(comfort.additionalAnnualSavings).toBeLessThan(25000);
    expect(comfort.additionalAnnualSavings).toBeGreaterThan(0);
  });
});
