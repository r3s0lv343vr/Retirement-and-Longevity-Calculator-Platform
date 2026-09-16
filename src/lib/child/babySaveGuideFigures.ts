import { CHILD_DEFAULT, type ChildInput } from "./defaults";

/** Inputs used in the rewritten baby-savings guide. Must match Nest Eggs for a Child. */
export const BABY_SAVE_LIVING_INPUT: ChildInput = {
  ...CHILD_DEFAULT,
  childAge: 0,
  yearsUntilBaby: 0,
  monthlyChildCostToday: 900,
  ageDemandRate: 0.02,
  schoolStartAge: 5,
  schoolAnnualToday: 0,
  extraAnnualToday: 0,
  raisingSavings: 0,
  raisingAnnualSave: 0,
  universityStartAge: 18,
  universityYears: 4,
  universityAnnualToday: 0,
  universitySavings: 0,
  universityAnnualSave: 0,
  inflationRate: 0.04,
  educationInflationRate: 0.05,
  returnRate: 0.05,
};

export const BABY_SAVE_UNIVERSITY_INPUT: ChildInput = {
  ...BABY_SAVE_LIVING_INPUT,
  monthlyChildCostToday: 0,
  ageDemandRate: 0,
  universityAnnualToday: 28_000,
};

export const BABY_SAVE_CONTRIBUTION_INPUT: ChildInput = {
  ...BABY_SAVE_LIVING_INPUT,
  raisingSavings: 25_000,
  raisingAnnualSave: 12_000,
};

export const BABY_SAVE_CARE_IN_MONTHLY_INPUT: ChildInput = {
  ...BABY_SAVE_LIVING_INPUT,
  monthlyChildCostToday: 2_400,
};

/** Rounded figures shown in the guide. Locked by estimateChild tests. */
export const BABY_SAVE_FIGURES = {
  monthly: 900,
  c1: 10_800,
  inflationRate: 0.04,
  ageDemandRate: 0.02,
  returnRate: 0.05,
  educationInflationRate: 0.05,
  livingY0: 10_800,
  livingY5: 14_507,
  livingY10: 19_488,
  livingY17: 29_457,
  raisingEggLivingOnly: 202_300,
  raisingEggNoAgeDemand: 170_900,
  raisingEggWithSave: 62_000,
  additionalEggWithSave: 37_000,
  extraAnnualWithSave: 3_200,
  yearsUntilReady: 7,
  raisingSavings: 25_000,
  raisingAnnualSave: 12_000,
  universityAnnualToday: 28_000,
  universityYears: 4,
  universityStartAge: 18,
  uniFirstYear: 67_385,
  uniLastYear: 78_007,
  uniEgg: 106_700,
  careMonthly: 1_500,
  carePlusLivingMonthly: 2_400,
  care2400Egg: 539_400,
  pvExampleFuture: 10_000,
  pvExampleYears: 10,
  pvExampleToday: 6_139,
  leaveMonthlyGap: 2_000,
  leaveMonths: 3,
  leaveReserve: 6_000,
} as const;
