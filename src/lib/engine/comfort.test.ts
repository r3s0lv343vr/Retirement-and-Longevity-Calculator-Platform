import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT } from "./defaults";
import { project } from "./index";
import {
  COMFORT_LIFESTYLE_FLOOR,
  adoptComfortBudget,
  comfortInputFrom,
  estimateComfort,
  extraAnnualSavings,
  sameSpendAmounts,
} from "./comfort";

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

  it("compares current savings at the suggested spend, without adopting yet", () => {
    const result = project(DEFAULT_INPUT);
    expect(result.comfort.suggestedLifestyleToday).toBeCloseTo(71_500);
    expect(result.comfort.suggestedHealthcareToday).toBe(8_400);
    expect(result.comfort.spendIfAdopted.fundedThroughAge).toBeLessThanOrEqual(result.outlook.fundedThroughAge);
    expect(result.input.lifestyleSpendToday).toBe(62_000);
  });
});

describe("adoptComfortBudget", () => {
  it("copies only lifestyle and healthcare", () => {
    const next = adoptComfortBudget(DEFAULT_INPUT);
    expect(next.lifestyleSpendToday).toBeCloseTo(71_500);
    expect(next.healthcareSpendToday).toBe(8_400);
    expect(next.currentSavings).toBe(DEFAULT_INPUT.currentSavings);
    expect(next.retirementAge).toBe(DEFAULT_INPUT.retirementAge);
    expect(next.socialSecurityAnnual).toBe(DEFAULT_INPUT.socialSecurityAnnual);
  });

  it("would ratchet if applied twice, so the UI remembers the chosen amounts", () => {
    const adopted = adoptComfortBudget(DEFAULT_INPUT);
    const again = adoptComfortBudget(adopted);
    expect(again.lifestyleSpendToday).toBeGreaterThan(adopted.lifestyleSpendToday);
    expect(sameSpendAmounts(adopted, 71_500, 8_400)).toBe(true);
    expect(sameSpendAmounts(DEFAULT_INPUT, 71_500, 8_400)).toBe(false);
  });
});
