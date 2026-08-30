import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT } from "./defaults";
import { project } from "./index";
import {
  applyWhatIf,
  compareWhatIf,
  fundedThroughDeltaCopy,
  suggestedWhatIfValue,
  whatIfChangeLabel,
} from "./whatIf";

describe("applyWhatIf", () => {
  it("changes only the chosen field", () => {
    const next = applyWhatIf(DEFAULT_INPUT, "retirementAge", 67);
    expect(next.retirementAge).toBe(67);
    expect(next.socialSecurityStartAge).toBe(DEFAULT_INPUT.socialSecurityStartAge);
    expect(next.pensionCola).toBe(DEFAULT_INPUT.pensionCola);
    expect(next.healthcareInflationRate).toBe(DEFAULT_INPUT.healthcareInflationRate);
    expect(next.currentSavings).toBe(DEFAULT_INPUT.currentSavings);
  });
});

describe("suggestedWhatIfValue", () => {
  it("offers retire at 67, SS at 70, COLA flipped, and medical inflation +1 point", () => {
    expect(suggestedWhatIfValue(DEFAULT_INPUT, "retirementAge")).toBe(67);
    expect(suggestedWhatIfValue(DEFAULT_INPUT, "socialSecurityStartAge")).toBe(70);
    expect(suggestedWhatIfValue(DEFAULT_INPUT, "pensionCola")).toBe(false);
    expect(suggestedWhatIfValue(DEFAULT_INPUT, "healthcareInflationRate")).toBeCloseTo(0.062);
  });
});

describe("compareWhatIf", () => {
  const baseline = project(DEFAULT_INPUT);

  it("puts a later retirement funded-through age beside this run", () => {
    const compare = compareWhatIf(DEFAULT_INPUT, baseline.outlook, "retirementAge", 67);
    expect(compare.errors).toEqual([]);
    expect(compare.sameAsBaseline).toBe(false);
    expect(compare.changeLabel).toBe("Full-time work ends: 65 → 67");
    expect(compare.baseline.fundedThroughAge).toBe(baseline.outlook.fundedThroughAge);
    expect(compare.variant?.fundedThroughAge).toBeGreaterThan(compare.baseline.fundedThroughAge);
    expect(compare.fundedThroughDelta).toBeGreaterThan(0);
  });

  it("shows delaying Social Security as the same annual benefit, later start", () => {
    const compare = compareWhatIf(DEFAULT_INPUT, baseline.outlook, "socialSecurityStartAge", 70);
    expect(compare.errors).toEqual([]);
    expect(compare.changeLabel).toBe("Social Security starts: 67 → 70");
    expect(compare.variant).not.toBeNull();
    expect(compare.variant?.fundedThroughAge).toBeLessThanOrEqual(compare.baseline.fundedThroughAge);
  });

  it("raises healthcare inflation and shortens the runway", () => {
    const compare = compareWhatIf(DEFAULT_INPUT, baseline.outlook, "healthcareInflationRate", 0.062);
    expect(compare.errors).toEqual([]);
    expect(compare.variant?.fundedThroughAge).toBeLessThanOrEqual(compare.baseline.fundedThroughAge);
  });

  it("notes when pension COLA cannot move a $0 pension", () => {
    const compare = compareWhatIf(DEFAULT_INPUT, baseline.outlook, "pensionCola", false);
    expect(compare.errors).toEqual([]);
    expect(compare.fundedThroughDelta).toBe(0);
    expect(compare.variant?.fundedThroughAge).toBe(compare.baseline.fundedThroughAge);
  });

  it("moves funded-through age when a real pension loses COLA", () => {
    const input = {
      ...DEFAULT_INPUT,
      currentSavings: 400000,
      pensionAnnual: 36000,
      lifestyleSpendToday: 72000,
    };
    const withPension = project(input);
    const compare = compareWhatIf(input, withPension.outlook, "pensionCola", false);
    expect(compare.errors).toEqual([]);
    expect(withPension.outlook.depleted).toBe(true);
    expect(compare.variant?.fundedThroughAge).toBeLessThan(compare.baseline.fundedThroughAge);
  });

  it("returns validation errors instead of a variant", () => {
    const compare = compareWhatIf(DEFAULT_INPUT, baseline.outlook, "retirementAge", 30);
    expect(compare.errors.length).toBeGreaterThan(0);
    expect(compare.variant).toBeNull();
    expect(compare.fundedThroughDelta).toBeNull();
  });
});

describe("whatIfChangeLabel", () => {
  it("formats the single change", () => {
    expect(whatIfChangeLabel(DEFAULT_INPUT, "healthcareInflationRate", 0.062)).toBe(
      "Healthcare inflation: 5.2% → 6.2%",
    );
  });
});

describe("fundedThroughDeltaCopy", () => {
  it("names longer, sooner, and same", () => {
    expect(fundedThroughDeltaCopy(2)).toBe("Lasts 2 years longer than this run.");
    expect(fundedThroughDeltaCopy(-1)).toBe("Runs out 1 year sooner than this run.");
    expect(fundedThroughDeltaCopy(0)).toBe("Same funded-through age as this run.");
  });
});
