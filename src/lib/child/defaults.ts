export type ChildInput = {
  childAge: number;
  yearsUntilBaby: number;
  monthlyChildCostToday: number;
  ageDemandRate: number;
  schoolStartAge: number;
  schoolAnnualToday: number;
  extraAnnualToday: number;
  raisingSavings: number;
  raisingAnnualSave: number;
  universityStartAge: number;
  universityYears: number;
  universityAnnualToday: number;
  universitySavings: number;
  universityAnnualSave: number;
  inflationRate: number;
  educationInflationRate: number;
  returnRate: number;
};

export type ChildPayload = Partial<ChildInput>;

/** Newborn / on the way. Living costs grow with age and inflation; school and university stay separate. */
export const CHILD_DEFAULT: ChildInput = {
  childAge: 0,
  yearsUntilBaby: 0,
  monthlyChildCostToday: 1_200,
  ageDemandRate: 0.02,
  schoolStartAge: 5,
  schoolAnnualToday: 12_000,
  extraAnnualToday: 3_600,
  raisingSavings: 0,
  raisingAnnualSave: 0,
  universityStartAge: 18,
  universityYears: 4,
  universityAnnualToday: 28_000,
  universitySavings: 0,
  universityAnnualSave: 0,
  inflationRate: 0.04,
  educationInflationRate: 0.05,
  returnRate: 0.05,
};
