export { DEFAULT_INPUT, FIELD_META } from "./defaults";
export { mergeInput, validateInput, warningsFor } from "./validate";
export { project, inflate, lifePhase, lifestyleMultiplier, healthcareAgeFactor, facilityHousing } from "./project";
export type {
  CalculatorInput,
  CalculatorPayload,
  HousingKind,
  LifePhase,
  Outlook,
  OutlookStatus,
  ProjectionResult,
  YearRow,
} from "./types";
