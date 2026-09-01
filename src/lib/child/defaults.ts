export type ChildInput = {
  childAge: number;
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
  returnRate: number;
};

export type ChildPayload = Partial<ChildInput>;

/** Newborn / on the way. School and extras through university start; university as its own pot. */
export const CHILD_DEFAULT: ChildInput = {
  childAge: 0,
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
  returnRate: 0.05,
};
