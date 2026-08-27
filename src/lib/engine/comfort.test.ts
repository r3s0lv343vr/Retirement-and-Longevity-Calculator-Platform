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

  it("fills independent-living rent when the user left housing at zero", () => {
    const next = comfortInputFrom({
      ...DEFAULT_INPUT,
      seniorHomeRentAnnual: 0,
      nursingHomeRentAnnual: 0,
      ccrcRentAnnual: 0,
    });
    expect(next.seniorHomeRentAnnual).toBe(36000);
    expect(next.seniorHomeStartAge).toBe(80);
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
});
