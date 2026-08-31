import { DEFAULT_INPUT } from "./defaults";
import type { CalculatorInput, CalculatorPayload } from "./types";

const MAX_MONEY = 50_000_000;
const MAX_AGE = 120;

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value !== 0;
  if (typeof value === "string") {
    const s = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(s)) return true;
    if (["false", "0", "no", "off"].includes(s)) return false;
  }
  return fallback;
}

export function mergeInput(payload: CalculatorPayload | null | undefined): CalculatorInput {
  const src = payload ?? {};
  const merged = { ...DEFAULT_INPUT };
  (Object.keys(DEFAULT_INPUT) as (keyof CalculatorInput)[]).forEach((key) => {
    if (
      key === "pensionCola" ||
      key === "savingsGrowWithInflation" ||
      key === "twoPerson" ||
      key === "partnerPensionCola"
    ) {
      merged[key] = asBoolean(src[key], DEFAULT_INPUT[key]);
      return;
    }
    merged[key] = asNumber(src[key], DEFAULT_INPUT[key] as number);
  });
  return merged;
}

export function validateInput(input: CalculatorInput): string[] {
  const errors: string[] = [];
  const moneyKeys: (keyof CalculatorInput)[] = [
    "currentSavings",
    "annualContribution",
    "lifestyleSpendToday",
    "healthcareSpendToday",
    "socialSecurityAnnual",
    "pensionAnnual",
    "partTimeAnnualIncome",
    "partTimeAnnualInvestment",
    "longTermCareAnnual",
    "seniorHomeRentAnnual",
    "nursingHomeRentAnnual",
    "ccrcRentAnnual",
    "partnerSocialSecurityAnnual",
    "partnerPensionAnnual",
    "annualWorkIncome",
    "partnerAnnualWorkIncome",
    "partnerPartTimeAnnualIncome",
    "partnerHealthcareSpendToday",
    "partnerLongTermCareAnnual",
    "partnerNursingHomeRentAnnual",
  ];
  const rateKeys: (keyof CalculatorInput)[] = [
    "preRetirementReturn",
    "postRetirementReturn",
    "partTimeInvestmentReturn",
    "inflationRate",
    "healthcareInflationRate",
  ];
  const multiplierKeys: (keyof CalculatorInput)[] = [
    "goGoLifestyleMultiplier",
    "slowGoLifestyleMultiplier",
    "noGoLifestyleMultiplier",
    "survivorLifestyleFactor",
  ];
  const survivorShareKeys: (keyof CalculatorInput)[] = ["pensionSurvivorPercent", "partnerPensionSurvivorPercent"];

  if (input.currentAge < 18 || input.currentAge > 90) {
    errors.push("Current age must be between 18 and 90.");
  }
  if (input.retirementAge < 40 || input.retirementAge > 90) {
    errors.push("Retirement age must be between 40 and 90.");
  }
  if (input.planToAge < input.currentAge) {
    errors.push("Plan-through age must be on or after your current age.");
  }
  if (input.planToAge < input.retirementAge) {
    errors.push("Plan-through age must be on or after retirement.");
  }
  if (input.planToAge > MAX_AGE) {
    errors.push("Plan-through age cannot exceed 120.");
  }
  if (input.goGoEndAge < input.retirementAge) {
    errors.push("Go-go years should extend through retirement.");
  }
  if (input.slowGoEndAge <= input.goGoEndAge) {
    errors.push("Slow-go years must end after go-go years.");
  }
  if (
    (input.partTimeAnnualIncome > 0 || input.partTimeAnnualInvestment > 0) &&
    input.partTimeEndAge < input.partTimeStartAge
  ) {
    errors.push("Part-time work must end on or after it starts.");
  }
  if (input.twoPerson) {
    if (input.partnerCurrentAge < 18 || input.partnerCurrentAge > 90) {
      errors.push("Partner age must be between 18 and 90.");
    }
    if (input.partnerRetirementAge < 40 || input.partnerRetirementAge > 90) {
      errors.push("Partner retirement age must be between 40 and 90.");
    }
    if (input.partnerPlanToAge < input.partnerCurrentAge) {
      errors.push("Partner plan-through age must be on or after their current age.");
    }
    if (input.partnerPlanToAge < input.partnerRetirementAge) {
      errors.push("Partner plan-through age must be on or after their retirement.");
    }
    if (input.partnerPlanToAge > MAX_AGE) {
      errors.push("Partner plan-through age cannot exceed 120.");
    }
    if (input.partnerPartTimeAnnualIncome > 0 && input.partnerPartTimeEndAge < input.partnerPartTimeStartAge) {
      errors.push("Partner part-time work must end on or after it starts.");
    }
  }

  for (const key of moneyKeys) {
    const value = input[key] as number;
    if (value < 0 || value > MAX_MONEY) {
      errors.push(`${key} is out of range.`);
    }
  }
  for (const key of rateKeys) {
    const value = input[key] as number;
    if (value < -0.1 || value > 0.25) {
      errors.push(`${key} must be between -10% and 25%.`);
    }
  }
  for (const key of multiplierKeys) {
    const value = input[key] as number;
    if (value < 0.2 || value > 2.5) {
      errors.push(`${key} must be between 0.2 and 2.5.`);
    }
  }
  for (const key of survivorShareKeys) {
    const value = input[key] as number;
    if (value < 0 || value > 1) {
      errors.push(`${key} must be between 0% and 100%.`);
    }
  }

  return errors;
}

export function warningsFor(input: CalculatorInput): string[] {
  const warnings: string[] = [];
  if (input.planToAge < 90) {
    warnings.push("Many planners use 90–95 as a longevity floor. A shorter horizon can look safer than it is.");
  }
  if (input.healthcareInflationRate <= input.inflationRate) {
    warnings.push("Healthcare costs have historically risen faster than general inflation.");
  }
  if (input.partTimeAnnualIncome > 0 && input.partTimeEndAge - input.partTimeStartAge < 3) {
    warnings.push("A short part-time window helps early retirement more than later longevity.");
  }
  if (input.postRetirementReturn > input.preRetirementReturn) {
    warnings.push("Returns in retirement are usually modeled lower than accumulation-year returns.");
  }
  if (input.ccrcRentAnnual > 0 && (input.seniorHomeRentAnnual > 0 || input.nursingHomeRentAnnual > 0)) {
    warnings.push("Continuing-care rent is used instead of senior rental and nursing home rent when all are filled.");
  }
  if (input.nursingHomeRentAnnual > 0 && input.nursingHomeStartAge < input.seniorHomeStartAge && input.seniorHomeRentAnnual > 0) {
    warnings.push("Nursing home starts before senior rental, so independent-living rent will never be charged.");
  }
  if (input.twoPerson && input.partnerPlanToAge < 90) {
    warnings.push("The partner plan-through age is below 90. A shorter second horizon can look safer than it is.");
  }
  if (input.twoPerson) {
    const partnerRetireAsPrimary = input.currentAge + (input.partnerRetirementAge - input.partnerCurrentAge);
    if (partnerRetireAsPrimary !== input.retirementAge) {
      warnings.push(
        partnerRetireAsPrimary < input.retirementAge
          ? "The partner leaves full-time work first, so household drawdowns start then — not at the first person’s work-end."
          : "The first person leaves full-time work first, so household drawdowns start then. Yearly saving continues until the partner’s work-end.",
      );
    }
  }
  if (input.twoPerson && input.partnerNursingHomeRentAnnual > 0 && input.nursingHomeRentAnnual > 0) {
    warnings.push("Two nursing rents can both apply in the same year if both people are alive and in care.");
  }
  return warnings;
}
