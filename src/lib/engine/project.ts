import type { CalculatorInput, HousingKind, LifePhase, Outlook, ProjectionResult, YearRow } from "./types";
import { warningsFor } from "./validate";

export function inflate(amount: number, rate: number, years: number): number {
  return amount * (1 + rate) ** years;
}

/** FV = PV (1 + r)^n */
export function futureValueLump(presentValue: number, rate: number, years: number): number {
  if (years <= 0) return presentValue;
  return presentValue * (1 + rate) ** years;
}

/** Ordinary (end-of-year) annuity: FV = PMT [((1 + r)^n − 1) / r] */
export function futureValueOrdinaryAnnuity(payment: number, rate: number, years: number): number {
  if (years <= 0) return 0;
  if (Math.abs(rate) < 1e-12) return payment * years;
  return payment * (((1 + rate) ** years - 1) / rate);
}

/** Nest-egg phase: grow current savings, then add level annual deposits. */
export function nestEggAtRetirement(
  presentValue: number,
  annualSavings: number,
  rate: number,
  years: number,
): number {
  return futureValueLump(presentValue, rate, years) + futureValueOrdinaryAnnuity(annualSavings, rate, years);
}

/** Accumulation years until full-time work ends. Already retired → 0. */
export function nestEggYears(input: CalculatorInput): number {
  return Math.max(0, input.retirementAge - input.currentAge);
}

export function nestEggBreakdown(input: CalculatorInput): {
  years: number;
  lump: number;
  annuity: number;
  total: number;
} {
  const years = nestEggYears(input);
  const lump = futureValueLump(input.currentSavings, input.preRetirementReturn, years);
  const annuity = futureValueOrdinaryAnnuity(input.annualContribution, input.preRetirementReturn, years);
  return { years, lump, annuity, total: lump + annuity };
}

export function phasedWorkWindow(input: CalculatorInput): { start: number; end: number; years: number } {
  const start = Math.max(input.partTimeStartAge, input.retirementAge, input.currentAge);
  const end = input.partTimeEndAge;
  if (end < start) return { start, end, years: 0 };
  return { start, end, years: end - start + 1 };
}

/**
 * Guaranteed-income window for one stream.
 * Starts at the later of the benefit start, the nest-egg cutoff (full-time work ends),
 * and current age; ends at the plan-through age.
 */
export function guaranteedIncomeWindow(
  startAge: number,
  input: CalculatorInput,
): { start: number; end: number; years: number } {
  const start = Math.max(startAge, input.retirementAge, input.currentAge);
  const end = input.planToAge;
  if (end < start) return { start, end, years: 0 };
  return { start, end, years: end - start + 1 };
}

/**
 * Sum of n annual payments that grow at `rate`, starting `firstYearsFromNow` years from today.
 * At r = 0% this is payment × years.
 */
export function growingPaymentSum(payment: number, rate: number, firstYearsFromNow: number, years: number): number {
  if (years <= 0 || payment <= 0) return 0;
  if (Math.abs(rate) < 1e-12) return payment * years;
  return payment * (1 + rate) ** firstYearsFromNow * (((1 + rate) ** years - 1) / rate);
}

/**
 * Social Security with COLA (general inflation) plus pension.
 * Pension is omitted when it is $0. Pension COLA follows `pensionCola`.
 */
export function guaranteedIncomeAnnuity(input: CalculatorInput): number {
  const ss = guaranteedIncomeWindow(input.socialSecurityStartAge, input);
  const socialSecurity = growingPaymentSum(
    input.socialSecurityAnnual,
    input.inflationRate,
    ss.start - input.currentAge,
    ss.years,
  );
  if (input.pensionAnnual <= 0) return socialSecurity;
  const pension = guaranteedIncomeWindow(input.pensionStartAge, input);
  const pensionRate = input.pensionCola ? input.inflationRate : 0;
  return (
    socialSecurity +
    growingPaymentSum(input.pensionAnnual, pensionRate, pension.start - input.currentAge, pension.years)
  );
}

function streamPay(annual: number, cola: boolean, inflationRate: number, yearsFromNow: number): number {
  if (annual <= 0) return 0;
  return cola ? inflate(annual, inflationRate, yearsFromNow) : annual;
}

export function socialSecurityAtAge(age: number, input: CalculatorInput, yearsFromNow: number): number {
  const ss = guaranteedIncomeWindow(input.socialSecurityStartAge, input);
  if (ss.years <= 0 || age < ss.start || age > ss.end) return 0;
  return streamPay(input.socialSecurityAnnual, true, input.inflationRate, yearsFromNow);
}

export function pensionAtAge(age: number, input: CalculatorInput, yearsFromNow: number): number {
  if (input.pensionAnnual <= 0) return 0;
  const pension = guaranteedIncomeWindow(input.pensionStartAge, input);
  if (pension.years <= 0 || age < pension.start || age > pension.end) return 0;
  return streamPay(input.pensionAnnual, input.pensionCola, input.inflationRate, yearsFromNow);
}

function guaranteedIncomeAtAge(age: number, input: CalculatorInput, yearsFromNow: number): number {
  return socialSecurityAtAge(age, input, yearsFromNow) + pensionAtAge(age, input, yearsFromNow);
}

export function lifePhase(age: number, input: CalculatorInput): LifePhase {
  if (age < input.retirementAge) return "working";
  if (age <= input.goGoEndAge) return "go-go";
  if (age <= input.slowGoEndAge) return "slow-go";
  return "no-go";
}

export function lifestyleMultiplier(age: number, input: CalculatorInput): number {
  const phase = lifePhase(age, input);
  if (phase === "working") return 1;
  if (phase === "go-go") return input.goGoLifestyleMultiplier;
  if (phase === "slow-go") return input.slowGoLifestyleMultiplier;
  return input.noGoLifestyleMultiplier;
}

const HOUSING_LIFESTYLE_FACTOR: Record<Exclude<HousingKind, null>, number> = {
  independent: 0.72,
  ccrc: 0.58,
  nursing: 0.42,
};

/** One facility stream at a time: CCRC, else nursing, else senior rental. */
export function facilityHousing(
  age: number,
  input: CalculatorInput,
  yearsFromNow: number,
  medicalRate: number,
): { rent: number; kind: HousingKind; lifestyleFactor: number } {
  if (input.ccrcRentAnnual > 0 && age >= input.ccrcStartAge) {
    return {
      rent: inflate(input.ccrcRentAnnual, medicalRate, yearsFromNow),
      kind: "ccrc",
      lifestyleFactor: HOUSING_LIFESTYLE_FACTOR.ccrc,
    };
  }
  if (input.nursingHomeRentAnnual > 0 && age >= input.nursingHomeStartAge) {
    return {
      rent: inflate(input.nursingHomeRentAnnual, medicalRate, yearsFromNow),
      kind: "nursing",
      lifestyleFactor: HOUSING_LIFESTYLE_FACTOR.nursing,
    };
  }
  if (input.seniorHomeRentAnnual > 0 && age >= input.seniorHomeStartAge) {
    return {
      rent: inflate(input.seniorHomeRentAnnual, input.inflationRate, yearsFromNow),
      kind: "independent",
      lifestyleFactor: HOUSING_LIFESTYLE_FACTOR.independent,
    };
  }
  return { rent: 0, kind: null, lifestyleFactor: 1 };
}

export function healthcareAgeFactor(age: number): number {
  if (age < 65) return 1;
  if (age < 75) return 1.22;
  if (age < 85) return 1.75;
  return 2.45;
}

function runYears(input: CalculatorInput, straightLine: boolean): YearRow[] {
  const years: YearRow[] = [];
  let balance = input.currentSavings;
  let depleted = false;
  const workWindow = phasedWorkWindow(input);
  let investActive = input.partTimeAnnualInvestment > 0;

  for (let age = input.currentAge; age <= input.planToAge; age += 1) {
    const yearsFromNow = age - input.currentAge;
    const working = age < input.retirementAge;

    if (working) {
      const yearsDone = age - input.currentAge;
      const rate = input.preRetirementReturn;
      const startBalance = nestEggAtRetirement(
        input.currentSavings,
        input.annualContribution,
        rate,
        yearsDone,
      );
      const endBalance = nestEggAtRetirement(
        input.currentSavings,
        input.annualContribution,
        rate,
        yearsDone + 1,
      );
      const contribution = input.annualContribution;
      const growth = startBalance * rate;
      balance = endBalance;
      years.push({
        age,
        phase: "working",
        startBalance,
        growth,
        contribution,
        guaranteedIncome: 0,
        partTimeIncome: 0,
        lifestyleSpend: 0,
        healthcareSpend: 0,
        longTermCareSpend: 0,
        housingSpend: 0,
        housingKind: null,
        totalSpend: 0,
        netCashFlow: contribution,
        endBalance,
        depleted: false,
      });
      continue;
    }

    const startBalance = Math.max(balance, 0);
    const rate = input.postRetirementReturn;
    const inPhasedWork = age >= workWindow.start && age <= workWindow.end && workWindow.years > 0;
    const investPmt =
      investActive && inPhasedWork && input.partTimeAnnualInvestment > 0 ? input.partTimeAnnualInvestment : 0;
    const investYear = inPhasedWork ? age - workWindow.start + 1 : 0;
    const sidecar =
      investPmt > 0 && investYear > 0
        ? nestEggAtRetirement(0, investPmt, input.partTimeInvestmentReturn, investYear)
        : 0;
    const contribution = investPmt;
    const guaranteedIncome = guaranteedIncomeAtAge(age, input, yearsFromNow);

    const partTimeIncome =
      input.partTimeAnnualIncome > 0 &&
      age >= input.partTimeStartAge &&
      age <= input.partTimeEndAge
        ? inflate(input.partTimeAnnualIncome, input.inflationRate, yearsFromNow)
        : 0;

    const healthInflation = straightLine ? input.inflationRate : input.healthcareInflationRate;
    const lifeMult = straightLine ? 1 : lifestyleMultiplier(age, input);
    const healthMult = straightLine ? 1 : healthcareAgeFactor(age);

    const housing = straightLine
      ? { rent: 0, kind: null as HousingKind, lifestyleFactor: 1 }
      : facilityHousing(age, input, yearsFromNow, healthInflation);
    const housingSpend = housing.rent;
    const housingKind = housing.kind;
    const lifestyleSpend =
      inflate(input.lifestyleSpendToday, input.inflationRate, yearsFromNow) * lifeMult * housing.lifestyleFactor;
    const healthcareSpend = inflate(input.healthcareSpendToday, healthInflation, yearsFromNow) * healthMult;
    const facilityIncludesCare = housing.kind === "nursing" || housing.kind === "ccrc";
    const longTermCareSpend =
      !straightLine &&
      !facilityIncludesCare &&
      age >= input.longTermCareStartAge &&
      input.longTermCareAnnual > 0
        ? inflate(input.longTermCareAnnual, healthInflation, yearsFromNow)
        : 0;

    const totalSpend = lifestyleSpend + healthcareSpend + longTermCareSpend + housingSpend;
    const inflow = guaranteedIncome + partTimeIncome;
    const netCashFlow = inflow - totalSpend;

    const afterCash = startBalance + netCashFlow;
    let growth: number;
    let mainEnd: number;
    let endBalance: number;
    if (afterCash < 0) {
      growth = 0;
      if (afterCash + sidecar >= 0) {
        mainEnd = afterCash + sidecar;
        endBalance = mainEnd;
        depleted = false;
        investActive = false;
      } else {
        mainEnd = 0;
        endBalance = 0;
        depleted = true;
        investActive = false;
      }
      balance = mainEnd;
    } else {
      growth = afterCash * rate;
      mainEnd = afterCash + growth;
      if (inPhasedWork && age < workWindow.end) {
        endBalance = mainEnd + sidecar;
        balance = mainEnd;
      } else if (inPhasedWork && age === workWindow.end) {
        mainEnd += sidecar;
        endBalance = mainEnd;
        balance = mainEnd;
      } else {
        endBalance = mainEnd;
        balance = mainEnd;
      }
    }

    if (endBalance < 0) {
      depleted = true;
      endBalance = 0;
      balance = 0;
    }

    years.push({
      age,
      phase: lifePhase(age, input),
      startBalance,
      growth,
      contribution,
      guaranteedIncome: working ? 0 : guaranteedIncome,
      partTimeIncome,
      lifestyleSpend,
      healthcareSpend,
      longTermCareSpend,
      housingSpend,
      housingKind,
      totalSpend,
      netCashFlow,
      endBalance,
      depleted: depleted && endBalance === 0 && !working,
    });
  }

  return years;
}

function firstDepletionAge(years: YearRow[]): number | null {
  const row = years.find((y) => y.depleted);
  return row ? row.age : null;
}

function fundedThrough(years: YearRow[], planToAge: number): number {
  const depletion = firstDepletionAge(years);
  if (depletion == null) return planToAge;
  return Math.max(depletion, years[0]?.age ?? depletion);
}

function fundedRetirementYears(years: YearRow[]): YearRow[] {
  const funded: YearRow[] = [];
  for (const y of years) {
    if (y.phase === "working") continue;
    funded.push(y);
    if (y.depleted) break;
  }
  return funded;
}

function buildOutlook(input: CalculatorInput, years: YearRow[], straight: YearRow[]): Outlook {
  const fundedYears = fundedRetirementYears(years);
  const last = years[years.length - 1];
  const depletionAge = firstDepletionAge(years);
  const depleted = depletionAge != null;
  const fundedThroughAge = fundedThrough(years, input.planToAge);
  const endingBalance = depleted ? 0 : last?.endBalance ?? 0;
  const lastYearSpend = fundedYears.at(-1)?.totalSpend ?? 0;

  const totalHealthcareSpend = fundedYears.reduce((s, y) => s + y.healthcareSpend, 0);
  const totalLifestyleSpend = fundedYears.reduce((s, y) => s + y.lifestyleSpend, 0);
  const totalLongTermCareSpend = fundedYears.reduce((s, y) => s + y.longTermCareSpend, 0);
  const totalHousingSpend = fundedYears.reduce((s, y) => s + y.housingSpend, 0);
  const totalSpend = totalHealthcareSpend + totalLifestyleSpend + totalLongTermCareSpend + totalHousingSpend;
  const healthcareShare = totalSpend > 0 ? (totalHealthcareSpend + totalLongTermCareSpend + totalHousingSpend) / totalSpend : 0;
  const nestEgg = nestEggBreakdown(input);
  const partTimeWages = fundedYears.reduce((s, y) => s + y.partTimeIncome, 0);
  const window = phasedWorkWindow(input);
  const investedYears = fundedYears.filter((y) => y.age >= window.start && y.age <= window.end).length;
  const partTimeInvested = nestEggAtRetirement(
    0,
    input.partTimeAnnualInvestment,
    input.partTimeInvestmentReturn,
    investedYears,
  );
  const partTimeTotal = partTimeWages + partTimeInvested;
  const socialSecurityTotal = fundedYears.reduce(
    (s, y) => s + socialSecurityAtAge(y.age, input, y.age - input.currentAge),
    0,
  );
  const pensionTotal = fundedYears.reduce(
    (s, y) => s + pensionAtAge(y.age, input, y.age - input.currentAge),
    0,
  );
  const retirementIncomeTotal = socialSecurityTotal + pensionTotal + partTimeTotal;
  const fundingTotal = nestEgg.total + retirementIncomeTotal;
  const totalMedicalSpend = totalHealthcareSpend + totalLongTermCareSpend + totalHousingSpend;
  const totalRetirementSpend = totalLifestyleSpend + totalMedicalSpend;

  let peakHealthcareAge: number | null = null;
  let peakHealthcareSpend = 0;
  for (const y of fundedYears) {
    const medical = y.healthcareSpend + y.longTermCareSpend + y.housingSpend;
    if (medical > peakHealthcareSpend) {
      peakHealthcareSpend = medical;
      peakHealthcareAge = y.age;
    }
  }

  const straightLineFundedThroughAge = fundedThrough(straight, input.planToAge);
  const straightLineEndingBalance = firstDepletionAge(straight) != null ? 0 : straight.at(-1)?.endBalance ?? 0;
  const longevityGapYears = straightLineFundedThroughAge - fundedThroughAge;

  const modeledFromAge = years[0]?.age ?? input.currentAge;
  const retirementStartAge = Math.max(input.retirementAge, modeledFromAge);
  const yearsInRetirement = Math.max(0, input.planToAge - retirementStartAge + 1);
  const yearsCovered = Math.min(
    yearsInRetirement,
    Math.max(0, fundedThroughAge - retirementStartAge + 1),
  );

  let status: Outlook["status"];
  if (!depleted && endingBalance >= lastYearSpend * 3) {
    status = "strong";
  } else if (!depleted) {
    status = "watchful";
  } else if (depletionAge != null && depletionAge >= input.planToAge - 4) {
    status = "watchful";
  } else if (depletionAge != null && depletionAge >= retirementStartAge + 12) {
    status = "at-risk";
  } else {
    status = "shortfall";
  }

  const copy: Record<Outlook["status"], { title: string; summary: string }> = {
    strong: {
      title: "On track through your longevity target",
      summary: `Under these assumptions, savings last through age ${fundedThroughAge} with a cushion of ${formatCompact(endingBalance)} remaining.`,
    },
    watchful: {
      title: "Likely to last — with little slack",
      summary: depleted
        ? `Savings reach about age ${fundedThroughAge}, close to your target of ${input.planToAge}. Small changes in health costs or returns could tip the result.`
        : `You reach age ${fundedThroughAge}, but the remaining balance is thin relative to later-life medical costs.`,
    },
    "at-risk": {
      title: "Savings may not outlive you",
      summary: `The portfolio is modeled to run out around age ${fundedThroughAge}, ${input.planToAge - fundedThroughAge} years before your longevity target.`,
    },
    shortfall: {
      title: "A meaningful longevity gap",
      summary: `Funds are modeled to last only to about age ${fundedThroughAge}. Healthcare inflation and later-life care are the largest pressure points.`,
    },
  };

  return {
    status,
    title: copy[status].title,
    summary: copy[status].summary,
    fundedThroughAge,
    depleted,
    depletionAge,
    endingBalance,
    yearsInRetirement,
    yearsCovered,
    totalHealthcareSpend,
    totalLifestyleSpend,
    totalLongTermCareSpend,
    totalHousingSpend,
    totalMedicalSpend,
    totalRetirementSpend,
    healthcareShare,
    peakHealthcareAge,
    peakHealthcareSpend,
    nestEggYears: nestEgg.years,
    nestEggLump: nestEgg.lump,
    nestEggAnnuity: nestEgg.annuity,
    nestEggAtRetirement: nestEgg.total,
    socialSecurityTotal,
    pensionTotal,
    partTimeWages,
    partTimeInvested,
    partTimeTotal,
    retirementIncomeTotal,
    fundingTotal,
    straightLineFundedThroughAge,
    straightLineEndingBalance,
    longevityGapYears,
    lastYearSpend,
  };
}

function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function projectBase(input: CalculatorInput): Omit<ProjectionResult, "comfort"> {
  const years = runYears(input, false);
  const straight = runYears(input, true);
  return {
    input,
    years,
    outlook: buildOutlook(input, years, straight),
    warnings: warningsFor(input),
  };
}
