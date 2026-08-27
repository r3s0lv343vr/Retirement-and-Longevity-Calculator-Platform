import type { CalculatorInput, HousingKind, LifePhase, Outlook, ProjectionResult, YearRow } from "./types";
import { warningsFor } from "./validate";

export function inflate(amount: number, rate: number, years: number): number {
  return amount * (1 + rate) ** years;
}

export function lifePhase(age: number, input: CalculatorInput): LifePhase {
  if (age < input.retirementAge) return "working";
  if (age < input.goGoEndAge) return "go-go";
  if (age < input.slowGoEndAge) return "slow-go";
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
  rate: number,
): { rent: number; kind: HousingKind; lifestyleFactor: number } {
  if (input.ccrcRentAnnual > 0 && age >= input.ccrcStartAge) {
    return {
      rent: inflate(input.ccrcRentAnnual, rate, yearsFromNow),
      kind: "ccrc",
      lifestyleFactor: HOUSING_LIFESTYLE_FACTOR.ccrc,
    };
  }
  if (input.nursingHomeRentAnnual > 0 && age >= input.nursingHomeStartAge) {
    return {
      rent: inflate(input.nursingHomeRentAnnual, rate, yearsFromNow),
      kind: "nursing",
      lifestyleFactor: HOUSING_LIFESTYLE_FACTOR.nursing,
    };
  }
  if (input.seniorHomeRentAnnual > 0 && age >= input.seniorHomeStartAge) {
    return {
      rent: inflate(input.seniorHomeRentAnnual, rate, yearsFromNow),
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

  for (let age = input.currentAge; age <= input.planToAge; age += 1) {
    const yearsFromNow = age - input.currentAge;
    const startBalance = Math.max(balance, 0);
    const working = age < input.retirementAge;
    const rate = working ? input.preRetirementReturn : input.postRetirementReturn;
    const growth = startBalance * rate;
    balance = startBalance + growth;

    const contribution = working
      ? inflate(input.annualContribution, input.inflationRate, yearsFromNow)
      : 0;

    const socialSecurity =
      age >= input.socialSecurityStartAge
        ? inflate(input.socialSecurityAnnual, input.inflationRate, yearsFromNow)
        : 0;
    const pension =
      age >= input.pensionStartAge
        ? inflate(input.pensionAnnual, input.inflationRate, yearsFromNow)
        : 0;
    const guaranteedIncome = socialSecurity + pension;

    const partTimeIncome =
      !working &&
      input.partTimeAnnualIncome > 0 &&
      age >= input.partTimeStartAge &&
      age < input.partTimeEndAge
        ? inflate(input.partTimeAnnualIncome, input.inflationRate, yearsFromNow)
        : 0;

    const healthInflation = straightLine ? input.inflationRate : input.healthcareInflationRate;
    const lifeMult = straightLine ? 1 : lifestyleMultiplier(age, input);
    const healthMult = straightLine ? 1 : healthcareAgeFactor(age);

    let lifestyleSpend = 0;
    let healthcareSpend = 0;
    let longTermCareSpend = 0;
    let housingSpend = 0;
    let housingKind: HousingKind = null;

    if (!working) {
      const housing = straightLine
        ? { rent: 0, kind: null as HousingKind, lifestyleFactor: 1 }
        : facilityHousing(age, input, yearsFromNow, healthInflation);
      housingSpend = housing.rent;
      housingKind = housing.kind;
      lifestyleSpend =
        inflate(input.lifestyleSpendToday, input.inflationRate, yearsFromNow) * lifeMult * housing.lifestyleFactor;
      healthcareSpend = inflate(input.healthcareSpendToday, healthInflation, yearsFromNow) * healthMult;
      const facilityIncludesCare = housing.kind === "nursing" || housing.kind === "ccrc";
      if (
        !straightLine &&
        !facilityIncludesCare &&
        age >= input.longTermCareStartAge &&
        input.longTermCareAnnual > 0
      ) {
        longTermCareSpend = inflate(input.longTermCareAnnual, healthInflation, yearsFromNow);
      }
    }

    const totalSpend = lifestyleSpend + healthcareSpend + longTermCareSpend + housingSpend;
    const inflow = contribution + (working ? 0 : guaranteedIncome + partTimeIncome);
    const netCashFlow = inflow - totalSpend;
    balance += netCashFlow;

    let endBalance = balance;
    if (endBalance < 0) {
      if (!depleted) depleted = true;
      endBalance = 0;
    }
    balance = endBalance;

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

function buildOutlook(input: CalculatorInput, years: YearRow[], straight: YearRow[]): Outlook {
  const retirementYears = years.filter((y) => y.phase !== "working");
  const last = years[years.length - 1];
  const depletionAge = firstDepletionAge(years);
  const depleted = depletionAge != null;
  const fundedThroughAge = fundedThrough(years, input.planToAge);
  const endingBalance = last?.endBalance ?? 0;
  const lastYearSpend = retirementYears.at(-1)?.totalSpend ?? 0;

  const totalHealthcareSpend = retirementYears.reduce((s, y) => s + y.healthcareSpend, 0);
  const totalLifestyleSpend = retirementYears.reduce((s, y) => s + y.lifestyleSpend, 0);
  const totalLongTermCareSpend = retirementYears.reduce((s, y) => s + y.longTermCareSpend, 0);
  const totalHousingSpend = retirementYears.reduce((s, y) => s + y.housingSpend, 0);
  const totalSpend = totalHealthcareSpend + totalLifestyleSpend + totalLongTermCareSpend + totalHousingSpend;
  const healthcareShare = totalSpend > 0 ? (totalHealthcareSpend + totalLongTermCareSpend + totalHousingSpend) / totalSpend : 0;
  const partTimeTotal = retirementYears.reduce((s, y) => s + y.partTimeIncome, 0);

  let peakHealthcareAge: number | null = null;
  let peakHealthcareSpend = 0;
  for (const y of retirementYears) {
    const medical = y.healthcareSpend + y.longTermCareSpend + y.housingSpend;
    if (medical > peakHealthcareSpend) {
      peakHealthcareSpend = medical;
      peakHealthcareAge = y.age;
    }
  }

  const straightLineFundedThroughAge = fundedThrough(straight, input.planToAge);
  const straightLineEndingBalance = straight.at(-1)?.endBalance ?? 0;
  const longevityGapYears = straightLineFundedThroughAge - fundedThroughAge;

  const yearsInRetirement = Math.max(0, input.planToAge - input.retirementAge + 1);
  const yearsCovered = Math.max(0, fundedThroughAge - input.retirementAge);

  let status: Outlook["status"];
  if (!depleted && endingBalance >= lastYearSpend * 3) {
    status = "strong";
  } else if (!depleted) {
    status = "watchful";
  } else if (depletionAge != null && depletionAge >= input.planToAge - 4) {
    status = "watchful";
  } else if (depletionAge != null && depletionAge >= input.retirementAge + 12) {
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
    healthcareShare,
    peakHealthcareAge,
    peakHealthcareSpend,
    partTimeTotal,
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
