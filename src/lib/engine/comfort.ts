import type { CalculatorInput, ComfortEstimate } from "./types";
import { nestEggYears, projectBase } from "./project";
import { snapshotFromOutlook } from "./whatIf";

/** Moderate US planning floor for a comfortable lifestyle (today’s dollars), not a high-cost city. */
export const COMFORT_LIFESTYLE_FLOOR = 65_000;
export const COMFORT_HEALTHCARE_FLOOR = 8_400;
export const COMFORT_LIFESTYLE_BUFFER = 1.1;
/** Two-person household lifestyle floor is this times the one-person floor, then the usual buffer. */
export const HOUSEHOLD_LIFESTYLE_SCALE = 1.6;
export const COMFORT_HOUSING_PLACEHOLDER = 36_000;
export const COMFORT_HOUSING_START_AGE = 80;

export function comfortLifestyleFloor(input: CalculatorInput): number {
  return input.twoPerson ? COMFORT_LIFESTYLE_FLOOR * HOUSEHOLD_LIFESTYLE_SCALE : COMFORT_LIFESTYLE_FLOOR;
}

export function comfortInputFrom(input: CalculatorInput): CalculatorInput {
  const suggestedLifestyle = Math.max(input.lifestyleSpendToday, comfortLifestyleFloor(input)) * COMFORT_LIFESTYLE_BUFFER;
  const suggestedHealthcare = Math.max(input.healthcareSpendToday, COMFORT_HEALTHCARE_FLOOR);
  const suggestedPartnerHealthcare = input.twoPerson
    ? Math.max(input.partnerHealthcareSpendToday, COMFORT_HEALTHCARE_FLOOR)
    : input.partnerHealthcareSpendToday;

  return {
    ...input,
    lifestyleSpendToday: suggestedLifestyle,
    healthcareSpendToday: suggestedHealthcare,
    partnerHealthcareSpendToday: suggestedPartnerHealthcare,
  };
}

function isFunded(input: CalculatorInput, savings: number): boolean {
  const result = projectBase({ ...input, currentSavings: savings });
  if (result.outlook.depleted) return false;
  const last = result.years[result.years.length - 1];
  const livingCushion = (last?.lifestyleSpend ?? 0) + (last?.healthcareSpend ?? 0);
  return result.outlook.endingBalance >= livingCushion;
}

export function nestEggNeededNow(input: CalculatorInput): number {
  if (isFunded(input, 0)) return 0;
  let lo = 0;
  let hi = 25_000_000;
  if (!isFunded(input, hi)) return hi;
  for (let i = 0; i < 36; i += 1) {
    const mid = (lo + hi) / 2;
    if (isFunded(input, mid)) hi = mid;
    else lo = mid;
  }
  return Math.ceil(hi / 100) * 100;
}

/** Extra yearly savings to close a present-value nest-egg gap before retirement. */
export function extraAnnualSavings(gapToday: number, years: number, rate: number): number {
  if (gapToday <= 0 || years <= 0) return 0;
  if (Math.abs(rate) < 1e-8) return gapToday / years;
  const growth = (1 + rate) ** years;
  return (gapToday * rate * growth) / (growth - 1);
}

export function estimateComfort(input: CalculatorInput): ComfortEstimate {
  const comfortInput = comfortInputFrom(input);
  const usedHousingPlaceholder = false;
  const nestEggNeeded = nestEggNeededNow(comfortInput);
  const additionalNestEgg = Math.max(0, nestEggNeeded - input.currentSavings);
  const yearsToRetirement = nestEggYears(input);
  const additionalAnnualSavings = extraAnnualSavings(
    additionalNestEgg,
    yearsToRetirement,
    input.preRetirementReturn,
  );
  const spendRun = projectBase(comfortInput);
  const comfortRun = projectBase({ ...comfortInput, currentSavings: Math.max(input.currentSavings, nestEggNeeded) });

  const partnerHealthcare = input.twoPerson ? comfortInput.partnerHealthcareSpendToday : 0;
  return {
    suggestedLifestyleToday: comfortInput.lifestyleSpendToday,
    suggestedHealthcareToday: comfortInput.healthcareSpendToday,
    suggestedPartnerHealthcareToday: partnerHealthcare,
    suggestedAnnualBudgetToday: comfortInput.lifestyleSpendToday + comfortInput.healthcareSpendToday + partnerHealthcare,
    usedHousingPlaceholder,
    placeholderHousingAnnual: usedHousingPlaceholder ? COMFORT_HOUSING_PLACEHOLDER : 0,
    placeholderHousingStartAge: usedHousingPlaceholder ? COMFORT_HOUSING_START_AGE : 0,
    nestEggNeededNow: nestEggNeeded,
    additionalNestEgg,
    additionalAnnualSavings,
    yearsToRetirement,
    fundedThroughIfFunded: comfortRun.outlook.fundedThroughAge,
    spendIfAdopted: snapshotFromOutlook(spendRun.outlook),
  };
}

/** Copy only the suggested lifestyle and healthcare onto the entered plan. */
export function adoptComfortBudget(input: CalculatorInput): CalculatorInput {
  const comfort = comfortInputFrom(input);
  return {
    ...input,
    lifestyleSpendToday: comfort.lifestyleSpendToday,
    healthcareSpendToday: comfort.healthcareSpendToday,
    partnerHealthcareSpendToday: input.twoPerson
      ? comfort.partnerHealthcareSpendToday
      : input.partnerHealthcareSpendToday,
  };
}

export function sameSpendAmounts(
  input: CalculatorInput,
  lifestyle: number,
  healthcare: number,
  partnerHealthcare = 0,
): boolean {
  const lifestyleOk = Math.round(input.lifestyleSpendToday) === Math.round(lifestyle);
  const healthcareOk = Math.round(input.healthcareSpendToday) === Math.round(healthcare);
  if (!input.twoPerson) return lifestyleOk && healthcareOk;
  return lifestyleOk && healthcareOk && Math.round(input.partnerHealthcareSpendToday) === Math.round(partnerHealthcare);
}
