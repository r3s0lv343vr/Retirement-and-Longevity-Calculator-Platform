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

export function mergeInput(payload: CalculatorPayload | null | undefined): CalculatorInput {
  const src = payload ?? {};
  const merged = { ...DEFAULT_INPUT };
  (Object.keys(DEFAULT_INPUT) as (keyof CalculatorInput)[]).forEach((key) => {
    merged[key] = asNumber(src[key], DEFAULT_INPUT[key]);
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
  ];

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

  for (const key of moneyKeys) {
    if (input[key] < 0 || input[key] > MAX_MONEY) {
      errors.push(`${key} is out of range.`);
    }
  }
  for (const key of rateKeys) {
    if (input[key] < -0.1 || input[key] > 0.25) {
      errors.push(`${key} must be between -10% and 25%.`);
    }
  }
  for (const key of multiplierKeys) {
    if (input[key] < 0.2 || input[key] > 2.5) {
      errors.push(`${key} must be between 0.2 and 2.5.`);
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
  return warnings;
}
