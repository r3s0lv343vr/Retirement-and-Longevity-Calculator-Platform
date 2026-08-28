import { estimateComfort } from "./comfort";
import { projectBase } from "./project";
import type { CalculatorInput, ProjectionResult } from "./types";

export function project(input: CalculatorInput): ProjectionResult {
  return { ...projectBase(input), comfort: estimateComfort(input) };
}

export { DEFAULT_INPUT, FIELD_META } from "./defaults";
export { mergeInput, validateInput, warningsFor } from "./validate";
export { inflate, futureValueLump, futureValueOrdinaryAnnuity, nestEggAtRetirement, phasedWorkWindow, lifePhase, lifestyleMultiplier, healthcareAgeFactor, facilityHousing, projectBase } from "./project";
export { estimateComfort, extraAnnualSavings, nestEggNeededNow, comfortInputFrom } from "./comfort";
export type {
  CalculatorInput,
  CalculatorPayload,
  ComfortEstimate,
  HousingKind,
  LifePhase,
  Outlook,
  OutlookStatus,
  ProjectionResult,
  YearRow,
} from "./types";
