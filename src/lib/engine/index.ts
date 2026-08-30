import { estimateComfort } from "./comfort";
import { projectBase } from "./project";
import type { CalculatorInput, ProjectionResult } from "./types";

export function project(input: CalculatorInput): ProjectionResult {
  return { ...projectBase(input), comfort: estimateComfort(input) };
}

export { DEFAULT_INPUT, FIELD_META } from "./defaults";
export { mergeInput, validateInput, warningsFor } from "./validate";
export {
  inflate,
  futureValueLump,
  futureValueOrdinaryAnnuity,
  futureValueGrowingOrdinaryAnnuity,
  nestEggAtRetirement,
  nestEggYears,
  nestEggBreakdown,
  phasedWorkWindow,
  guaranteedIncomeWindow,
  guaranteedIncomeAnnuity,
  growingPaymentSum,
  socialSecurityAtAge,
  pensionAtAge,
  socialSecurityClaimFactor,
  socialSecurityAnnualAtClaimAge,
  badDecadeReturn,
  BAD_DECADE_YEARS,
  BAD_DECADE_RETURN_CUT,
  lifePhase,
  lifestyleMultiplier,
  healthcareAgeFactor,
  facilityHousing,
  projectBase,
} from "./project";
export { estimateComfort, extraAnnualSavings, nestEggNeededNow, comfortInputFrom, adoptComfortBudget, sameSpendAmounts } from "./comfort";
export {
  WHAT_IF_LEVERS,
  WHAT_IF_LEVER_COPY,
  applyWhatIf,
  suggestedWhatIfValue,
  formatWhatIfValue,
  whatIfChangeLabel,
  snapshotFromOutlook,
  compareWhatIf,
  fundedThroughDeltaCopy,
} from "./whatIf";
export type { WhatIfLever, WhatIfSnapshot, WhatIfComparison } from "./whatIf";
export type {
  CalculatorInput,
  CalculatorPayload,
  ComfortEstimate,
  HousingKind,
  LifePhase,
  Outlook,
  OutlookStatus,
  PlanSnapshot,
  ProjectionResult,
  YearRow,
} from "./types";
