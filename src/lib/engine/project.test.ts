import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT } from "./defaults";
import { healthcareAgeFactor, inflate, projectBase } from "./project";
import { mergeInput, validateInput } from "./validate";
import type { CalculatorInput } from "./types";

function run(overrides: Partial<CalculatorInput> = {}) {
  return projectBase({ ...DEFAULT_INPUT, ...overrides });
}

describe("inflate", () => {
  it("compounds a dollar amount", () => {
    expect(inflate(100, 0.1, 2)).toBeCloseTo(121);
  });
});

describe("healthcareAgeFactor", () => {
  it("rises in later decades", () => {
    expect(healthcareAgeFactor(60)).toBe(1);
    expect(healthcareAgeFactor(70)).toBeGreaterThan(healthcareAgeFactor(60));
    expect(healthcareAgeFactor(90)).toBeGreaterThan(healthcareAgeFactor(80));
  });
});

describe("validateInput", () => {
  it("rejects retirement before current age", () => {
    const input = mergeInput({ currentAge: 70, retirementAge: 65 });
    expect(validateInput(input).join(" ")).toMatch(/Retirement age/);
  });
});

describe("project", () => {
  it("keeps a large nest egg solvent through the plan age", () => {
    const result = run({
      currentSavings: 5_000_000,
      lifestyleSpendToday: 40000,
      healthcareSpendToday: 5000,
      longTermCareAnnual: 0,
    });
    expect(result.outlook.depleted).toBe(false);
    expect(result.outlook.status).toBe("strong");
    expect(result.outlook.fundedThroughAge).toBe(result.input.planToAge);
  });

  it("depletes quickly with almost no savings and high spending", () => {
    const result = run({
      currentSavings: 20000,
      annualContribution: 0,
      partTimeAnnualIncome: 0,
      socialSecurityAnnual: 0,
      pensionAnnual: 0,
      lifestyleSpendToday: 80000,
      healthcareSpendToday: 12000,
    });
    expect(result.outlook.depleted).toBe(true);
    expect(result.outlook.status).toBe("shortfall");
    expect(result.outlook.fundedThroughAge).toBeLessThan(result.input.planToAge);
  });

  it("shows a shorter runway than a straight-line spend model", () => {
    const result = run({
      currentSavings: 550000,
      annualContribution: 0,
      partTimeAnnualIncome: 0,
      longTermCareAnnual: 24000,
    });
    expect(result.outlook.fundedThroughAge).toBeLessThanOrEqual(
      result.outlook.straightLineFundedThroughAge,
    );
    expect(result.outlook.longevityGapYears).toBeGreaterThanOrEqual(0);
  });

  it("extends coverage when part-time income is included", () => {
    const without = run({
      currentSavings: 480000,
      partTimeAnnualIncome: 0,
      annualContribution: 0,
    });
    const withWork = run({
      currentSavings: 480000,
      partTimeAnnualIncome: 40000,
      partTimeStartAge: 65,
      partTimeEndAge: 75,
      annualContribution: 0,
    });
    expect(withWork.outlook.fundedThroughAge).toBeGreaterThanOrEqual(without.outlook.fundedThroughAge);
    expect(withWork.outlook.partTimeTotal).toBeGreaterThan(0);
  });

  it("does not withdraw for living costs while still working", () => {
    const result = run();
    const working = result.years.filter((y) => y.phase === "working");
    expect(working.length).toBeGreaterThan(0);
    expect(working.every((y) => y.totalSpend === 0)).toBe(true);
    expect(working.every((y) => y.contribution > 0)).toBe(true);
  });

  it("raises medical costs in no-go years versus go-go years", () => {
    const result = run({ healthcareInflationRate: 0 });
    const go = result.years.find((y) => y.age === 70);
    const noGo = result.years.find((y) => y.age === 90);
    expect(go && noGo).toBeTruthy();
    if (go && noGo) {
      expect(noGo.healthcareSpend + noGo.longTermCareSpend).toBeGreaterThan(go.healthcareSpend);
    }
  });

  it("charges senior rental then switches to nursing home", () => {
    const result = run({
      seniorHomeRentAnnual: 36000,
      seniorHomeStartAge: 75,
      nursingHomeRentAnnual: 100000,
      nursingHomeStartAge: 85,
      ccrcRentAnnual: 0,
      longTermCareAnnual: 0,
      healthcareInflationRate: 0,
      inflationRate: 0,
    });
    const independent = result.years.find((y) => y.age === 80);
    const nursing = result.years.find((y) => y.age === 90);
    expect(independent?.housingKind).toBe("independent");
    expect(independent?.housingSpend).toBeCloseTo(36000);
    expect(nursing?.housingKind).toBe("nursing");
    expect(nursing?.housingSpend).toBeCloseTo(100000);
    expect(result.outlook.totalHousingSpend).toBeGreaterThan(0);
  });

  it("uses continuing-care rent instead of senior rental and nursing", () => {
    const result = run({
      seniorHomeRentAnnual: 36000,
      nursingHomeRentAnnual: 100000,
      ccrcRentAnnual: 48000,
      ccrcStartAge: 75,
      healthcareInflationRate: 0,
      inflationRate: 0,
    });
    const row = result.years.find((y) => y.age === 88);
    expect(row?.housingKind).toBe("ccrc");
    expect(row?.housingSpend).toBeCloseTo(48000);
    expect(row?.longTermCareSpend).toBe(0);
  });

  it("shortens the runway when nursing home rent is added", () => {
    const without = run({
      currentSavings: 700000,
      annualContribution: 0,
      partTimeAnnualIncome: 0,
      nursingHomeRentAnnual: 0,
    });
    const withNursing = run({
      currentSavings: 700000,
      annualContribution: 0,
      partTimeAnnualIncome: 0,
      nursingHomeRentAnnual: 120000,
      nursingHomeStartAge: 80,
    });
    expect(withNursing.outlook.fundedThroughAge).toBeLessThanOrEqual(without.outlook.fundedThroughAge);
    expect(withNursing.years.find((y) => y.age === 82)?.housingSpend).toBeGreaterThan(0);
  });

  it("reduces lifestyle spending after a move into senior housing", () => {
    const result = run({
      seniorHomeRentAnnual: 40000,
      seniorHomeStartAge: 75,
      inflationRate: 0,
      healthcareInflationRate: 0,
      goGoLifestyleMultiplier: 1,
      slowGoLifestyleMultiplier: 1,
      noGoLifestyleMultiplier: 1,
    });
    const before = result.years.find((y) => y.age === 70);
    const after = result.years.find((y) => y.age === 76);
    expect(before && after).toBeTruthy();
    if (before && after) {
      expect(after.lifestyleSpend).toBeLessThan(before.lifestyleSpend);
    }
  });
});
