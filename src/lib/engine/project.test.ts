import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT } from "./defaults";
import { healthcareAgeFactor, inflate, futureValueLump, futureValueOrdinaryAnnuity, nestEggAtRetirement, guaranteedIncomeAnnuity, guaranteedIncomeWindow, projectBase } from "./project";
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

describe("nest egg formulas", () => {
  it("grows current savings as a future value", () => {
    expect(futureValueLump(71000, 0.07, 24)).toBeCloseTo(360138.05, 2);
  });

  it("grows level annual savings as an ordinary annuity", () => {
    expect(futureValueOrdinaryAnnuity(13000, 0.07, 24)).toBeCloseTo(756296.72, 2);
  });

  it("adds those two pieces for capital at retirement", () => {
    expect(nestEggAtRetirement(71000, 13000, 0.07, 24)).toBeCloseTo(1116434.77, 2);
  });

  it("uses those formulas as the opening balance at retirement", () => {
    const result = run({
      currentAge: 41,
      retirementAge: 65,
      currentSavings: 71000,
      annualContribution: 13000,
      preRetirementReturn: 0.07,
    });
    expect(result.years.find((y) => y.age === 65)?.startBalance).toBeCloseTo(
      nestEggAtRetirement(71000, 13000, 0.07, 24),
      6,
    );
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
  it("rejects a plan that ends before today", () => {
    const input = mergeInput({ currentAge: 70, planToAge: 60 });
    expect(validateInput(input).join(" ")).toMatch(/Plan-through age/);
  });

  it("allows a plan that is already in retirement", () => {
    const input = mergeInput({ currentAge: 70, retirementAge: 65, planToAge: 95 });
    expect(validateInput(input)).toEqual([]);
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
    expect(result.outlook.yearsCovered).toBe(result.outlook.yearsInRetirement);
    expect(result.outlook.yearsInRetirement).toBe(DEFAULT_INPUT.planToAge - DEFAULT_INPUT.retirementAge + 1);
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

  it("does not inflate annual savings; it does inflate retirement spending", () => {
    const result = run({
      currentAge: 41,
      retirementAge: 65,
      currentSavings: 71000,
      annualContribution: 13000,
      inflationRate: 0.026,
    });
    const first = result.years.find((y) => y.age === 41);
    const lastWork = result.years.find((y) => y.age === 64);
    const firstRetire = result.years.find((y) => y.age === 65);
    expect(first?.contribution).toBe(13000);
    expect(lastWork?.contribution).toBe(13000);
    expect(firstRetire?.lifestyleSpend).toBeGreaterThan(62000);
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

  it("counts retirement years inclusively when savings run out", () => {
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
    expect(result.outlook.depletionAge).not.toBeNull();
    expect(result.outlook.yearsCovered).toBe(
      (result.outlook.depletionAge as number) - DEFAULT_INPUT.retirementAge + 1,
    );
    expect(result.outlook.peakHealthcareAge).toBeLessThanOrEqual(result.outlook.depletionAge as number);
  });

  it("includes part-time income in the year that work ends", () => {
    const result = run({
      inflationRate: 0,
      partTimeAnnualIncome: 40000,
      partTimeStartAge: 65,
      partTimeEndAge: 72,
    });
    expect(result.years.find((y) => y.age === 72)?.partTimeIncome).toBeCloseTo(40000);
    expect(result.years.find((y) => y.age === 73)?.partTimeIncome).toBe(0);
  });

  it("treats go-go and slow-go end ages as inclusive", () => {
    const result = run();
    expect(result.years.find((y) => y.age === 75)?.phase).toBe("go-go");
    expect(result.years.find((y) => y.age === 76)?.phase).toBe("slow-go");
    expect(result.years.find((y) => y.age === 85)?.phase).toBe("slow-go");
    expect(result.years.find((y) => y.age === 86)?.phase).toBe("no-go");
  });

  it("projects spending immediately when already retired", () => {
    const result = run({
      currentAge: 70,
      retirementAge: 65,
      planToAge: 95,
      annualContribution: 0,
    });
    expect(result.years[0]?.age).toBe(70);
    expect(result.years[0]?.phase).not.toBe("working");
    expect(result.years[0]?.totalSpend).toBeGreaterThan(0);
    expect(result.outlook.yearsInRetirement).toBe(95 - 70 + 1);
  });

  it("earns a return only on the balance left after retirement spending", () => {
    const result = run({
      currentAge: 65,
      retirementAge: 65,
      currentSavings: 100000,
      annualContribution: 0,
      inflationRate: 0,
      healthcareInflationRate: 0,
      postRetirementReturn: 0.05,
      preRetirementReturn: 0.05,
      lifestyleSpendToday: 20000,
      healthcareSpendToday: 0,
      longTermCareAnnual: 0,
      socialSecurityAnnual: 5000,
      socialSecurityStartAge: 65,
      pensionAnnual: 0,
      partTimeAnnualIncome: 0,
      goGoLifestyleMultiplier: 1,
    });
    const row = result.years.find((y) => y.age === 65);
    expect(row).toBeTruthy();
    if (row) {
      expect(row.growth).toBeCloseTo((100000 + 5000 - 20000) * 0.05);
      expect(row.endBalance).toBeCloseTo(100000 + 5000 - 20000 + row.growth);
    }
  });

  it("inflates independent living with general inflation, not medical inflation", () => {
    const result = run({
      seniorHomeRentAnnual: 36000,
      seniorHomeStartAge: 75,
      inflationRate: 0.02,
      healthcareInflationRate: 0.1,
      currentAge: 65,
      retirementAge: 65,
    });
    const row = result.years.find((y) => y.age === 75);
    expect(row?.housingKind).toBe("independent");
    expect(row?.housingSpend).toBeCloseTo(36000 * 1.02 ** 10);
  });

  it("matches a 41-year-old nest egg and 0% guaranteed-income annuities", () => {
    const result = run({
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
      longTermCareStartAge: 85,
      seniorHomeRentAnnual: 0,
      nursingHomeRentAnnual: 0,
      ccrcRentAnnual: 0,
    });
    expect(result.years.find((y) => y.age === 65)?.startBalance).toBeCloseTo(1_116_434.77, 0);
    expect(result.years.find((y) => y.age === 41)?.contribution).toBe(13000);
    expect(result.years.find((y) => y.age === 64)?.contribution).toBe(13000);
    expect(result.outlook.fundedThroughAge).toBe(79);
    expect(result.outlook.yearsCovered).toBe(15);
    expect(result.outlook.yearsInRetirement).toBe(31);
    expect(result.outlook.totalHousingSpend).toBe(0);
    expect(result.outlook.peakHealthcareAge).toBe(79);
    expect(result.outlook.partTimeTotal).toBeCloseTo(371720, 0);
  });

  it("adds phased-work extra savings as amount × years when the rate is 0%", () => {
    const result = run({
      currentAge: 65,
      retirementAge: 65,
      planToAge: 80,
      currentSavings: 5_000_000,
      inflationRate: 0,
      healthcareInflationRate: 0,
      partTimeAnnualIncome: 16000,
      partTimeStartAge: 65,
      partTimeEndAge: 74,
      partTimeAnnualInvestment: 1000,
      partTimeInvestmentReturn: 0,
      lifestyleSpendToday: 10000,
      healthcareSpendToday: 0,
      longTermCareAnnual: 0,
      socialSecurityAnnual: 0,
      pensionAnnual: 0,
      goGoLifestyleMultiplier: 1,
    });
    expect(result.outlook.partTimeTotal).toBeCloseTo(16000 * 10 + 1000 * 10);
    const lastWindow = result.years.find((y) => y.age === 74);
    const afterWindow = result.years.find((y) => y.age === 75);
    expect(afterWindow?.startBalance).toBeCloseTo(lastWindow?.endBalance ?? 0);
  });

  it("adds phased-work extra savings as an ordinary annuity when a rate is set", () => {
    const result = run({
      currentAge: 65,
      retirementAge: 65,
      planToAge: 80,
      currentSavings: 5_000_000,
      inflationRate: 0,
      healthcareInflationRate: 0,
      partTimeAnnualIncome: 0,
      partTimeStartAge: 65,
      partTimeEndAge: 74,
      partTimeAnnualInvestment: 1000,
      partTimeInvestmentReturn: 0.07,
      lifestyleSpendToday: 10000,
      healthcareSpendToday: 0,
      longTermCareAnnual: 0,
      socialSecurityAnnual: 0,
      pensionAnnual: 0,
      goGoLifestyleMultiplier: 1,
    });
    const annuity = 1000 * ((1.07 ** 10 - 1) / 0.07);
    expect(result.outlook.partTimeTotal).toBeCloseTo(annuity);
  });

  it("keeps only wages × years when extra savings fields are left at zero", () => {
    const result = run({
      currentAge: 65,
      retirementAge: 65,
      currentSavings: 5_000_000,
      inflationRate: 0,
      healthcareInflationRate: 0,
      partTimeAnnualIncome: 16000,
      partTimeStartAge: 65,
      partTimeEndAge: 74,
      partTimeAnnualInvestment: 0,
      partTimeInvestmentReturn: 0,
      lifestyleSpendToday: 10000,
      healthcareSpendToday: 0,
      longTermCareAnnual: 0,
    });
    expect(result.outlook.partTimeTotal).toBeCloseTo(16000 * 10);
  });

  it("pays Social Security as a 0% annuity from the nest-egg cutoff through the plan-through age", () => {
    const result = run({
      currentAge: 41,
      retirementAge: 65,
      planToAge: 95,
      inflationRate: 0.1,
      socialSecurityAnnual: 28800,
      socialSecurityStartAge: 67,
      pensionAnnual: 0,
    });
    const ss = guaranteedIncomeWindow(67, result.input);
    expect(ss).toEqual({ start: 67, end: 95, years: 29 });
    expect(guaranteedIncomeAnnuity(result.input)).toBeCloseTo(futureValueOrdinaryAnnuity(28800, 0, 29));
    expect(result.years.find((y) => y.age === 65)?.guaranteedIncome).toBe(0);
    expect(result.years.find((y) => y.age === 66)?.guaranteedIncome).toBe(0);
    expect(result.years.find((y) => y.age === 67)?.guaranteedIncome).toBe(28800);
    expect(result.years.find((y) => y.age === 95)?.guaranteedIncome).toBe(28800);
    const paid = result.years.reduce((s, y) => s + y.guaranteedIncome, 0);
    expect(paid).toBeCloseTo(guaranteedIncomeAnnuity(result.input));
  });

  it("adds pension as a second 0% annuity and omits it when pension is $0", () => {
    const both = run({
      currentAge: 41,
      retirementAge: 65,
      planToAge: 95,
      inflationRate: 0.1,
      socialSecurityAnnual: 28800,
      socialSecurityStartAge: 67,
      pensionAnnual: 36000,
      pensionStartAge: 65,
    });
    const ssYears = 95 - 67 + 1;
    const pensionYears = 95 - 65 + 1;
    expect(guaranteedIncomeAnnuity(both.input)).toBeCloseTo(28800 * ssYears + 36000 * pensionYears);
    expect(both.years.find((y) => y.age === 65)?.guaranteedIncome).toBe(36000);
    expect(both.years.find((y) => y.age === 67)?.guaranteedIncome).toBe(28800 + 36000);
    expect(both.years.reduce((s, y) => s + y.guaranteedIncome, 0)).toBeCloseTo(
      guaranteedIncomeAnnuity(both.input),
    );

    const ssOnly = run({
      currentAge: 41,
      retirementAge: 65,
      planToAge: 95,
      socialSecurityAnnual: 28800,
      socialSecurityStartAge: 67,
      pensionAnnual: 0,
      pensionStartAge: 65,
    });
    expect(guaranteedIncomeAnnuity(ssOnly.input)).toBeCloseTo(28800 * ssYears);
    expect(ssOnly.years.find((y) => y.age === 65)?.guaranteedIncome).toBe(0);
    expect(ssOnly.years.find((y) => y.age === 67)?.guaranteedIncome).toBe(28800);
  });
});
