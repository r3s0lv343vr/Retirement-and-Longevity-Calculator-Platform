import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT } from "./defaults";
import { healthcareAgeFactor, inflate, futureValueLump, futureValueOrdinaryAnnuity, futureValueGrowingOrdinaryAnnuity, nestEggAtRetirement, nestEggBreakdown, guaranteedIncomeAnnuity, guaranteedIncomeWindow, growingPaymentSum, projectBase, socialSecurityClaimFactor, socialSecurityAnnualAtClaimAge, badDecadeReturn } from "./project";
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

  it("breaks the retirement nest egg into lump plus annuity", () => {
    const nest = nestEggBreakdown({
      ...DEFAULT_INPUT,
      currentAge: 41,
      retirementAge: 65,
      currentSavings: 71000,
      annualContribution: 13000,
      preRetirementReturn: 0.07,
    });
    expect(nest.years).toBe(24);
    expect(nest.lump).toBeCloseTo(360138.05, 2);
    expect(nest.annuity).toBeCloseTo(756296.72, 2);
    expect(nest.total).toBeCloseTo(1116434.77, 2);
  });

  it("treats an already-retired plan as savings on hand", () => {
    const nest = nestEggBreakdown({
      ...DEFAULT_INPUT,
      currentAge: 70,
      retirementAge: 65,
      currentSavings: 500000,
      annualContribution: 13000,
    });
    expect(nest.years).toBe(0);
    expect(nest.lump).toBe(500000);
    expect(nest.annuity).toBe(0);
    expect(nest.total).toBe(500000);
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

  it("reads pension COLA as a boolean and defaults it to on", () => {
    expect(mergeInput({}).pensionCola).toBe(true);
    expect(mergeInput({ pensionCola: false }).pensionCola).toBe(false);
    expect(mergeInput({ pensionCola: "off" as unknown as boolean }).pensionCola).toBe(false);
  });

  it("reads rising yearly saving as a boolean and defaults it to off", () => {
    expect(mergeInput({}).savingsGrowWithInflation).toBe(false);
    expect(mergeInput({ savingsGrowWithInflation: true }).savingsGrowWithInflation).toBe(true);
    expect(mergeInput({ savingsGrowWithInflation: "on" as unknown as boolean }).savingsGrowWithInflation).toBe(true);
  });

  it("reads two persons as a boolean and defaults it to off", () => {
    expect(mergeInput({}).twoPerson).toBe(false);
    expect(mergeInput({ twoPerson: true }).twoPerson).toBe(true);
    expect(mergeInput({ twoPerson: "on" as unknown as boolean }).twoPerson).toBe(true);
    expect(mergeInput({ partnerPensionCola: "off" as unknown as boolean }).partnerPensionCola).toBe(false);
    expect(mergeInput({ twoPerson: true }).annualWorkIncome).toBe(0);
    expect(mergeInput({ twoPerson: true }).lifeInsuranceLump).toBe(0);
    expect(mergeInput({ twoPerson: true }).funeralCost).toBe(0);
  });
});

describe("social security claiming factors", () => {
  it("uses US full-retirement-age 67 factors", () => {
    expect(socialSecurityClaimFactor(62)).toBeCloseTo(0.7);
    expect(socialSecurityClaimFactor(67)).toBe(1);
    expect(socialSecurityClaimFactor(70)).toBeCloseTo(1.24);
  });

  it("scales the entered check from the entered start age", () => {
    expect(socialSecurityAnnualAtClaimAge(28800, 67, 67)).toBeCloseTo(28800);
    expect(socialSecurityAnnualAtClaimAge(28800, 67, 70)).toBeCloseTo(28800 * 1.24);
    expect(socialSecurityAnnualAtClaimAge(28800, 70, 67)).toBeCloseTo(28800 / 1.24);
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
    expect(result.outlook.requiredMonths).toBe(result.outlook.yearsInRetirement * 12);
    expect(result.outlook.coveredMonths).toBe(result.outlook.requiredMonths);
    expect(result.outlook.surplusMonths).toBeGreaterThan(0);
    expect(result.outlook.accumulatedMonths).toBeGreaterThan(result.outlook.requiredMonths);
    expect(result.outlook.surpassesRequiredMonths).toBe(true);
    expect(result.outlook.remainingSavings).toBeGreaterThan(0);
    expect(result.outlook.remainingExpenseNeed).toBe(0);
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

  it("matches a 41-year-old nest egg and COLA guaranteed income", () => {
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
    expect(result.outlook.fundedThroughAge).toBe(90);
    expect(result.outlook.yearsCovered).toBe(26);
    expect(result.outlook.yearsInRetirement).toBe(31);
    expect(result.outlook.totalHousingSpend).toBe(0);
    expect(result.outlook.peakHealthcareAge).toBe(90);
    expect(result.outlook.partTimeTotal).toBeCloseTo(371720, 0);
    const nest = nestEggBreakdown(result.input);
    expect(nest.lump).toBeCloseTo(360138.05, 0);
    expect(nest.annuity).toBeCloseTo(756296.72, 0);
    expect(result.outlook.nestEggLump).toBeCloseTo(nest.lump, 0);
    expect(result.outlook.nestEggAnnuity).toBeCloseTo(nest.annuity, 0);
    expect(result.outlook.nestEggAtRetirement).toBeCloseTo(1_116_434.77, 0);
    expect(result.outlook.partTimeWages).toBeCloseTo(371720, 0);
    expect(result.outlook.partTimeInvested).toBe(0);
    expect(result.outlook.pensionTotal).toBeGreaterThan(result.outlook.socialSecurityTotal);
    expect(result.outlook.retirementIncomeTotal).toBeCloseTo(
      result.outlook.socialSecurityTotal + result.outlook.pensionTotal + result.outlook.partTimeTotal,
    );
    expect(result.outlook.fundingTotal).toBeCloseTo(
      result.outlook.nestEggAtRetirement + result.outlook.retirementIncomeTotal,
    );
    expect(result.outlook.totalMedicalSpend).toBeCloseTo(
      result.outlook.totalHealthcareSpend + result.outlook.totalLongTermCareSpend + result.outlook.totalHousingSpend,
    );
    expect(result.outlook.totalRetirementSpend).toBeCloseTo(
      result.outlook.totalLifestyleSpend + result.outlook.totalMedicalSpend,
    );
    expect(result.outlook.totalLifestyleSpend).toBeGreaterThan(0);
    expect(result.outlook.totalHealthcareSpend).toBeGreaterThan(0);
    expect(result.outlook.totalLongTermCareSpend).toBeGreaterThan(0);
    expect(result.outlook.requiredMonths).toBe(31 * 12);
    expect(result.outlook.coveredMonths).toBe(26 * 12);
    expect(result.outlook.accumulatedMonths).toBe(26 * 12);
    expect(result.outlook.surpassesRequiredMonths).toBe(false);
    expect(result.outlook.remainingSavings).toBe(0);
    expect(result.outlook.remainingExpenseNeed).toBeGreaterThan(0);
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

  it("applies COLA to Social Security from the nest-egg cutoff through the plan-through age", () => {
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
    expect(result.years.find((y) => y.age === 65)?.guaranteedIncome).toBe(0);
    expect(result.years.find((y) => y.age === 66)?.guaranteedIncome).toBe(0);
    expect(result.years.find((y) => y.age === 67)?.guaranteedIncome).toBeCloseTo(inflate(28800, 0.1, 26));
    expect(result.years.find((y) => y.age === 95)?.guaranteedIncome).toBeCloseTo(inflate(28800, 0.1, 54));
    const paid = result.years.reduce((s, y) => s + y.guaranteedIncome, 0);
    expect(paid).toBeCloseTo(growingPaymentSum(28800, 0.1, 26, 29));
    expect(guaranteedIncomeAnnuity(result.input)).toBeCloseTo(paid);
  });

  it("lets pension COLA be turned off while Social Security still inflates", () => {
    const colaOn = run({
      currentAge: 65,
      retirementAge: 65,
      planToAge: 70,
      inflationRate: 0.1,
      socialSecurityAnnual: 0,
      pensionAnnual: 10000,
      pensionStartAge: 65,
      pensionCola: true,
      lifestyleSpendToday: 1000,
      healthcareSpendToday: 0,
      longTermCareAnnual: 0,
      currentSavings: 5_000_000,
    });
    expect(colaOn.years.find((y) => y.age === 65)?.guaranteedIncome).toBeCloseTo(10000);
    expect(colaOn.years.find((y) => y.age === 67)?.guaranteedIncome).toBeCloseTo(inflate(10000, 0.1, 2));

    const colaOff = run({
      currentAge: 65,
      retirementAge: 65,
      planToAge: 70,
      inflationRate: 0.1,
      socialSecurityAnnual: 20000,
      socialSecurityStartAge: 65,
      pensionAnnual: 10000,
      pensionStartAge: 65,
      pensionCola: false,
      lifestyleSpendToday: 1000,
      healthcareSpendToday: 0,
      longTermCareAnnual: 0,
      currentSavings: 5_000_000,
    });
    expect(colaOff.years.find((y) => y.age === 65)?.guaranteedIncome).toBeCloseTo(30000);
    expect(colaOff.years.find((y) => y.age === 67)?.guaranteedIncome).toBeCloseTo(inflate(20000, 0.1, 2) + 10000);
    expect(colaOff.years.filter((y) => y.age >= 65).every((y) => {
      const pension = y.guaranteedIncome - inflate(20000, 0.1, y.age - 65);
      return Math.abs(pension - 10000) < 1e-6;
    })).toBe(true);

    const omitted = run({
      currentAge: 65,
      retirementAge: 65,
      planToAge: 70,
      inflationRate: 0.1,
      socialSecurityAnnual: 20000,
      socialSecurityStartAge: 65,
      pensionAnnual: 0,
      pensionCola: true,
      currentSavings: 5_000_000,
      lifestyleSpendToday: 1000,
      healthcareSpendToday: 0,
      longTermCareAnnual: 0,
    });
    expect(omitted.years.find((y) => y.age === 67)?.guaranteedIncome).toBeCloseTo(inflate(20000, 0.1, 2));
    expect(guaranteedIncomeAnnuity(omitted.input)).toBeCloseTo(
      omitted.years.reduce((s, y) => s + y.guaranteedIncome, 0),
    );
  });

  it("leaves yearly savings level unless the inflation toggle is on", () => {
    const level = nestEggBreakdown({
      ...DEFAULT_INPUT,
      currentAge: 41,
      retirementAge: 65,
      currentSavings: 71000,
      annualContribution: 13000,
      preRetirementReturn: 0.07,
      savingsGrowWithInflation: false,
    });
    expect(level.annuity).toBeCloseTo(756296.72, 2);
    expect(level.total).toBeCloseTo(1116434.77, 2);

    const rising = nestEggBreakdown({
      ...DEFAULT_INPUT,
      currentAge: 41,
      retirementAge: 65,
      currentSavings: 71000,
      annualContribution: 13000,
      preRetirementReturn: 0.07,
      inflationRate: 0.026,
      savingsGrowWithInflation: true,
    });
    expect(rising.annuity).toBeCloseTo(
      futureValueGrowingOrdinaryAnnuity(13000, 0.07, 0.026, 24),
      6,
    );
    expect(rising.total).toBeGreaterThan(level.total);

    const risingRun = run({
      currentAge: 41,
      retirementAge: 65,
      currentSavings: 71000,
      annualContribution: 13000,
      preRetirementReturn: 0.07,
      inflationRate: 0.026,
      savingsGrowWithInflation: true,
    });
    expect(risingRun.years.find((y) => y.age === 41)?.contribution).toBe(13000);
    expect(risingRun.years.find((y) => y.age === 64)?.contribution).toBeCloseTo(13000 * 1.026 ** 23);
    expect(risingRun.years.find((y) => y.age === 65)?.startBalance).toBeCloseTo(rising.total, 6);
  });

  it("does not change the main Social Security dollars when comparing claim ages", () => {
    const result = run({
      socialSecurityAnnual: 28800,
      socialSecurityStartAge: 67,
    });
    expect(result.years.find((y) => y.age === 67)?.guaranteedIncome).toBeCloseTo(
      inflate(28800, result.input.inflationRate, 67 - result.input.currentAge),
    );
    expect(result.outlook.claiming67Annual).toBeCloseTo(28800);
    expect(result.outlook.claiming70Annual).toBeCloseTo(28800 * 1.24);
    expect(result.outlook.claiming70Annual).toBeGreaterThan(result.outlook.claiming67Annual);
  });

  it("funds a weak first decade no farther than the usual-return path", () => {
    const result = run({
      currentSavings: 550000,
      annualContribution: 0,
      partTimeAnnualIncome: 0,
      longTermCareAnnual: 24000,
    });
    expect(result.outlook.badDecadeReturn).toBeCloseTo(badDecadeReturn(result.input.postRetirementReturn));
    expect(result.outlook.badDecadeFundedThroughAge).toBeLessThanOrEqual(result.outlook.fundedThroughAge);
    expect(result.outlook.badDecadeGapYears).toBeGreaterThanOrEqual(0);
  });

  it("keeps the one-person path when two persons is on but the partner matches and adds no money", () => {
    const one = run();
    const two = run({
      twoPerson: true,
      partnerCurrentAge: DEFAULT_INPUT.currentAge,
      partnerPlanToAge: DEFAULT_INPUT.planToAge,
      partnerSocialSecurityAnnual: 0,
      partnerPensionAnnual: 0,
      partnerPartTimeAnnualIncome: 0,
      partnerHealthcareSpendToday: 0,
      partnerLongTermCareAnnual: 0,
      partnerNursingHomeRentAnnual: 0,
    });
    expect(two.outlook.householdHorizonAge).toBe(DEFAULT_INPUT.planToAge);
    expect(two.outlook.fundedThroughAge).toBe(one.outlook.fundedThroughAge);
    expect(two.years.filter((y) => y.age <= DEFAULT_INPUT.planToAge).map((y) => y.endBalance)).toEqual(
      one.years.map((y) => y.endBalance),
    );
  });

  it("keeps the larger Social Security check after the first death", () => {
    const result = run({
      twoPerson: true,
      currentAge: 65,
      retirementAge: 65,
      planToAge: 80,
      partnerCurrentAge: 65,
      partnerPlanToAge: 70,
      currentSavings: 5_000_000,
      inflationRate: 0,
      healthcareInflationRate: 0,
      socialSecurityAnnual: 20000,
      socialSecurityStartAge: 65,
      partnerSocialSecurityAnnual: 30000,
      partnerSocialSecurityStartAge: 65,
      pensionAnnual: 0,
      partnerPensionAnnual: 0,
      partTimeAnnualIncome: 0,
      partnerPartTimeAnnualIncome: 0,
      lifestyleSpendToday: 1000,
      healthcareSpendToday: 0,
      partnerHealthcareSpendToday: 0,
      longTermCareAnnual: 0,
      goGoLifestyleMultiplier: 1,
    });
    expect(result.years.find((y) => y.age === 70)?.guaranteedIncome).toBeCloseTo(50000);
    expect(result.years.find((y) => y.age === 71)?.guaranteedIncome).toBeCloseTo(30000);
    expect(result.years.find((y) => y.age === 71)?.primaryAlive).toBe(true);
    expect(result.years.find((y) => y.age === 71)?.partnerAlive).toBe(false);
    expect(result.outlook.firstDeathPrimaryAge).toBe(70);
  });

  it("continues a pension only by the survivor share", () => {
    const result = run({
      twoPerson: true,
      currentAge: 65,
      retirementAge: 65,
      planToAge: 70,
      partnerCurrentAge: 65,
      partnerPlanToAge: 80,
      currentSavings: 5_000_000,
      inflationRate: 0,
      healthcareInflationRate: 0,
      socialSecurityAnnual: 0,
      partnerSocialSecurityAnnual: 0,
      pensionAnnual: 12000,
      pensionStartAge: 65,
      pensionCola: false,
      pensionSurvivorPercent: 0.5,
      partnerPensionAnnual: 0,
      partTimeAnnualIncome: 0,
      lifestyleSpendToday: 1000,
      healthcareSpendToday: 0,
      longTermCareAnnual: 0,
      goGoLifestyleMultiplier: 1,
    });
    expect(result.years.find((y) => y.age === 70)?.guaranteedIncome).toBeCloseTo(12000);
    expect(result.years.find((y) => y.age === 71)?.guaranteedIncome).toBeCloseTo(6000);
  });

  it("adds a second side hustle on the partner’s ages", () => {
    const result = run({
      twoPerson: true,
      currentAge: 65,
      retirementAge: 65,
      planToAge: 75,
      partnerCurrentAge: 63,
      partnerPlanToAge: 75,
      currentSavings: 5_000_000,
      inflationRate: 0,
      healthcareInflationRate: 0,
      partTimeAnnualIncome: 0,
      partnerPartTimeAnnualIncome: 10000,
      partnerPartTimeStartAge: 63,
      partnerPartTimeEndAge: 68,
      socialSecurityAnnual: 0,
      partnerSocialSecurityAnnual: 0,
      lifestyleSpendToday: 1000,
      healthcareSpendToday: 0,
      longTermCareAnnual: 0,
      goGoLifestyleMultiplier: 1,
    });
    expect(result.years.find((y) => y.age === 65)?.partTimeIncome).toBeCloseTo(10000);
    expect(result.years.find((y) => y.age === 70)?.partTimeIncome).toBeCloseTo(10000);
    expect(result.years.find((y) => y.age === 71)?.partTimeIncome).toBe(0);
    expect(result.outlook.householdHorizonAge).toBe(77);
  });

  it("starts household drawdowns when the partner leaves work first", () => {
    const later = run({
      twoPerson: true,
      currentAge: 58,
      retirementAge: 65,
      partnerCurrentAge: 58,
      partnerRetirementAge: 65,
      partnerPlanToAge: 95,
      partnerSocialSecurityAnnual: 0,
      partnerHealthcareSpendToday: 0,
      partnerLongTermCareAnnual: 0,
      partnerNursingHomeRentAnnual: 0,
      partnerPartTimeAnnualIncome: 0,
    });
    const earlier = run({
      twoPerson: true,
      currentAge: 58,
      retirementAge: 65,
      partnerCurrentAge: 58,
      partnerRetirementAge: 62,
      partnerPlanToAge: 95,
      partnerSocialSecurityAnnual: 0,
      partnerHealthcareSpendToday: 0,
      partnerLongTermCareAnnual: 0,
      partnerNursingHomeRentAnnual: 0,
      partnerPartTimeAnnualIncome: 0,
    });
    expect(later.years.find((y) => y.age === 62)?.phase).toBe("working");
    expect(later.years.find((y) => y.age === 62)?.totalSpend).toBe(0);
    expect(earlier.years.find((y) => y.age === 62)?.phase).not.toBe("working");
    expect(earlier.years.find((y) => y.age === 62)?.totalSpend).toBeGreaterThan(0);
    expect(earlier.outlook.nestEggYears).toBe(4);
    expect(later.outlook.nestEggYears).toBe(7);
  });

  it("keeps yearly saving after drawdowns if the partner still works", () => {
    const result = run({
      twoPerson: true,
      currentAge: 65,
      retirementAge: 65,
      planToAge: 80,
      partnerCurrentAge: 63,
      partnerRetirementAge: 70,
      partnerPlanToAge: 80,
      currentSavings: 500000,
      annualContribution: 10000,
      savingsGrowWithInflation: false,
      inflationRate: 0,
      healthcareInflationRate: 0,
      lifestyleSpendToday: 1000,
      healthcareSpendToday: 0,
      partnerHealthcareSpendToday: 0,
      longTermCareAnnual: 0,
      socialSecurityAnnual: 0,
      partnerSocialSecurityAnnual: 0,
      partTimeAnnualIncome: 0,
      partnerPartTimeAnnualIncome: 0,
      goGoLifestyleMultiplier: 1,
    });
    expect(result.years.find((y) => y.age === 65)?.phase).not.toBe("working");
    expect(result.years.find((y) => y.age === 65)?.contribution).toBeCloseTo(10000);
    expect(result.years.find((y) => y.age === 71)?.contribution).toBeCloseTo(10000);
    expect(result.years.find((y) => y.age === 72)?.contribution).toBe(0);
  });

  it("counts remaining full-time pay after the first work-end, not on the side-hustle line", () => {
    const partnerStillWorks = run({
      twoPerson: true,
      currentAge: 65,
      retirementAge: 65,
      planToAge: 80,
      partnerCurrentAge: 65,
      partnerRetirementAge: 70,
      partnerPlanToAge: 80,
      annualWorkIncome: 0,
      partnerAnnualWorkIncome: 40000,
      currentSavings: 5_000_000,
      inflationRate: 0,
      healthcareInflationRate: 0,
      lifestyleSpendToday: 1000,
      healthcareSpendToday: 0,
      partnerHealthcareSpendToday: 0,
      longTermCareAnnual: 0,
      socialSecurityAnnual: 0,
      partnerSocialSecurityAnnual: 0,
      partTimeAnnualIncome: 8000,
      partTimeStartAge: 65,
      partTimeEndAge: 66,
      partnerPartTimeAnnualIncome: 0,
      goGoLifestyleMultiplier: 1,
    });
    expect(partnerStillWorks.years.find((y) => y.age === 65)?.workIncome).toBeCloseTo(40000);
    expect(partnerStillWorks.years.find((y) => y.age === 65)?.partTimeIncome).toBeCloseTo(8000);
    expect(partnerStillWorks.years.find((y) => y.age === 69)?.workIncome).toBeCloseTo(40000);
    expect(partnerStillWorks.years.find((y) => y.age === 70)?.workIncome).toBe(0);
    expect(partnerStillWorks.outlook.workIncomeTotal).toBeGreaterThan(0);

    const youStillWork = run({
      twoPerson: true,
      currentAge: 65,
      retirementAge: 70,
      planToAge: 80,
      partnerCurrentAge: 65,
      partnerRetirementAge: 65,
      partnerPlanToAge: 80,
      annualWorkIncome: 50000,
      partnerAnnualWorkIncome: 0,
      currentSavings: 5_000_000,
      inflationRate: 0,
      healthcareInflationRate: 0,
      lifestyleSpendToday: 1000,
      healthcareSpendToday: 0,
      longTermCareAnnual: 0,
      socialSecurityAnnual: 0,
      partnerSocialSecurityAnnual: 0,
      partTimeAnnualIncome: 0,
      goGoLifestyleMultiplier: 1,
    });
    expect(youStillWork.years.find((y) => y.age === 65)?.phase).not.toBe("working");
    expect(youStillWork.years.find((y) => y.age === 65)?.workIncome).toBeCloseTo(50000);
    expect(youStillWork.years.find((y) => y.age === 69)?.workIncome).toBeCloseTo(50000);
    expect(youStillWork.years.find((y) => y.age === 70)?.workIncome).toBe(0);
  });

  it("does not cut household lifestyle when only one person is in nursing", () => {
    const result = run({
      twoPerson: true,
      currentAge: 70,
      retirementAge: 65,
      planToAge: 80,
      partnerCurrentAge: 70,
      partnerPlanToAge: 80,
      currentSavings: 5_000_000,
      inflationRate: 0,
      healthcareInflationRate: 0,
      lifestyleSpendToday: 50000,
      healthcareSpendToday: 0,
      partnerHealthcareSpendToday: 0,
      longTermCareAnnual: 0,
      partnerLongTermCareAnnual: 0,
      nursingHomeRentAnnual: 100000,
      nursingHomeStartAge: 72,
      partnerNursingHomeRentAnnual: 0,
      ccrcRentAnnual: 0,
      seniorHomeRentAnnual: 0,
      socialSecurityAnnual: 0,
      partnerSocialSecurityAnnual: 0,
      partTimeAnnualIncome: 0,
      goGoLifestyleMultiplier: 1,
      slowGoLifestyleMultiplier: 1,
      noGoLifestyleMultiplier: 1,
    });
    const row = result.years.find((y) => y.age === 74);
    expect(row?.housingSpend).toBeCloseTo(100000);
    expect(row?.lifestyleSpend).toBeCloseTo(50000);
  });

  it("still counts a life-insurance payout that lands after savings run out", () => {
    const result = run({
      twoPerson: true,
      currentAge: 70,
      retirementAge: 65,
      planToAge: 95,
      partnerCurrentAge: 70,
      partnerPlanToAge: 90,
      currentSavings: 40000,
      annualContribution: 0,
      inflationRate: 0,
      healthcareInflationRate: 0,
      socialSecurityAnnual: 0,
      partnerSocialSecurityAnnual: 0,
      pensionAnnual: 0,
      partnerPensionAnnual: 0,
      partTimeAnnualIncome: 0,
      partnerPartTimeAnnualIncome: 0,
      lifestyleSpendToday: 30000,
      healthcareSpendToday: 0,
      partnerHealthcareSpendToday: 0,
      longTermCareAnnual: 0,
      goGoLifestyleMultiplier: 1,
      slowGoLifestyleMultiplier: 1,
      noGoLifestyleMultiplier: 1,
      lifeInsuranceLump: 250_000,
    });
    expect(result.outlook.depleted).toBe(true);
    expect(result.outlook.fundedThroughAge).toBeLessThan(90);
    expect(result.years.find((y) => y.lifeInsurance > 0)?.lifeInsurance).toBe(250_000);
    expect(result.outlook.lifeInsuranceTotal).toBe(250_000);
  });

  it("adds a life-insurance lump in the first survivor year only", () => {
    const none = run({
      twoPerson: true,
      currentAge: 65,
      retirementAge: 65,
      planToAge: 80,
      partnerCurrentAge: 65,
      partnerPlanToAge: 70,
      currentSavings: 5_000_000,
      inflationRate: 0,
      healthcareInflationRate: 0,
      socialSecurityAnnual: 0,
      partnerSocialSecurityAnnual: 0,
      pensionAnnual: 0,
      partnerPensionAnnual: 0,
      partTimeAnnualIncome: 0,
      partnerPartTimeAnnualIncome: 0,
      lifestyleSpendToday: 1000,
      healthcareSpendToday: 0,
      partnerHealthcareSpendToday: 0,
      longTermCareAnnual: 0,
      goGoLifestyleMultiplier: 1,
      lifeInsuranceLump: 0,
    });
    const insured = run({
      ...none.input,
      lifeInsuranceLump: 100_000,
    });
    expect(none.years.find((y) => y.age === 70)?.lifeInsurance).toBe(0);
    expect(none.years.find((y) => y.age === 71)?.lifeInsurance).toBe(0);
    expect(insured.years.find((y) => y.age === 70)?.lifeInsurance).toBe(0);
    expect(insured.years.find((y) => y.age === 71)?.lifeInsurance).toBe(100_000);
    expect(insured.years.find((y) => y.age === 72)?.lifeInsurance).toBe(0);
    expect(insured.outlook.lifeInsuranceTotal).toBe(100_000);
    expect(insured.years.find((y) => y.age === 71)?.endBalance).toBeGreaterThan(
      none.years.find((y) => y.age === 71)?.endBalance ?? 0,
    );
  });

  it("leaves balances unchanged when the life-insurance lump is $0", () => {
    const one = run({
      twoPerson: true,
      partnerCurrentAge: DEFAULT_INPUT.currentAge,
      partnerPlanToAge: DEFAULT_INPUT.planToAge,
      partnerSocialSecurityAnnual: 0,
      partnerPensionAnnual: 0,
      partnerPartTimeAnnualIncome: 0,
      partnerHealthcareSpendToday: 0,
      partnerLongTermCareAnnual: 0,
      partnerNursingHomeRentAnnual: 0,
      lifeInsuranceLump: 0,
    });
    const omitted = run({
      twoPerson: true,
      partnerCurrentAge: DEFAULT_INPUT.currentAge,
      partnerPlanToAge: DEFAULT_INPUT.planToAge,
      partnerSocialSecurityAnnual: 0,
      partnerPensionAnnual: 0,
      partnerPartTimeAnnualIncome: 0,
      partnerHealthcareSpendToday: 0,
      partnerLongTermCareAnnual: 0,
      partnerNursingHomeRentAnnual: 0,
    });
    expect(omitted.years.map((y) => y.endBalance)).toEqual(one.years.map((y) => y.endBalance));
    expect(omitted.outlook.lifeInsuranceTotal).toBe(0);
  });

  it("charges funeral cost the year each person leaves the plan", () => {
    const result = run({
      twoPerson: true,
      currentAge: 65,
      retirementAge: 65,
      planToAge: 80,
      partnerCurrentAge: 65,
      partnerPlanToAge: 70,
      currentSavings: 5_000_000,
      inflationRate: 0,
      healthcareInflationRate: 0,
      socialSecurityAnnual: 0,
      partnerSocialSecurityAnnual: 0,
      pensionAnnual: 0,
      partnerPensionAnnual: 0,
      partTimeAnnualIncome: 0,
      partnerPartTimeAnnualIncome: 0,
      lifestyleSpendToday: 1000,
      healthcareSpendToday: 0,
      partnerHealthcareSpendToday: 0,
      longTermCareAnnual: 0,
      goGoLifestyleMultiplier: 1,
      funeralCost: 12000,
    });
    expect(result.years.find((y) => y.age === 69)?.funeralSpend).toBe(0);
    expect(result.years.find((y) => y.age === 70)?.funeralSpend).toBeCloseTo(12000);
    expect(result.years.find((y) => y.age === 71)?.funeralSpend).toBe(0);
    expect(result.years.find((y) => y.age === 80)?.funeralSpend).toBeCloseTo(12000);
    expect(result.outlook.funeralTotal).toBeCloseTo(24000);
  });

  it("charges two funerals if both leave the plan the same year", () => {
    const result = run({
      twoPerson: true,
      currentAge: 65,
      retirementAge: 65,
      planToAge: 70,
      partnerCurrentAge: 65,
      partnerPlanToAge: 70,
      currentSavings: 5_000_000,
      inflationRate: 0,
      healthcareInflationRate: 0,
      socialSecurityAnnual: 0,
      partnerSocialSecurityAnnual: 0,
      lifestyleSpendToday: 1000,
      healthcareSpendToday: 0,
      partnerHealthcareSpendToday: 0,
      longTermCareAnnual: 0,
      goGoLifestyleMultiplier: 1,
      funeralCost: 10000,
    });
    expect(result.years.find((y) => y.age === 70)?.funeralSpend).toBeCloseTo(20000);
    expect(result.outlook.funeralTotal).toBeCloseTo(20000);
  });

  it("leaves balances unchanged when funeral cost is $0", () => {
    const none = run({
      twoPerson: true,
      partnerCurrentAge: DEFAULT_INPUT.currentAge,
      partnerPlanToAge: DEFAULT_INPUT.planToAge,
      partnerSocialSecurityAnnual: 0,
      partnerHealthcareSpendToday: 0,
      partnerLongTermCareAnnual: 0,
      partnerNursingHomeRentAnnual: 0,
      partnerPartTimeAnnualIncome: 0,
      funeralCost: 0,
    });
    const omitted = run({
      twoPerson: true,
      partnerCurrentAge: DEFAULT_INPUT.currentAge,
      partnerPlanToAge: DEFAULT_INPUT.planToAge,
      partnerSocialSecurityAnnual: 0,
      partnerHealthcareSpendToday: 0,
      partnerLongTermCareAnnual: 0,
      partnerNursingHomeRentAnnual: 0,
      partnerPartTimeAnnualIncome: 0,
    });
    expect(omitted.years.map((y) => y.endBalance)).toEqual(none.years.map((y) => y.endBalance));
    expect(omitted.outlook.funeralTotal).toBe(0);
  });
});
