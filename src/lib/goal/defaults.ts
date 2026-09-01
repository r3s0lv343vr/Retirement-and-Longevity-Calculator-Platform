export type GoalInput = {
  goalName: string;
  goalAmountToday: number;
  yearsToGoal: number;
  goalSavings: number;
  plannedAnnualToGoal: number;
  annualIncome: number;
  annualExpenses: number;
  otherSavings: number;
  inflationRate: number;
  goalReturn: number;
  otherReturn: number;
};

export type GoalPayload = Partial<GoalInput>;

/** Tight household cash flow so the first run shows whether expenses raid the earmarked pot. */
export const GOAL_DEFAULT: GoalInput = {
  goalName: "",
  goalAmountToday: 30_000,
  yearsToGoal: 5,
  goalSavings: 5_000,
  plannedAnnualToGoal: 4_800,
  annualIncome: 64_000,
  annualExpenses: 67_200,
  otherSavings: 6_000,
  inflationRate: 0.026,
  goalReturn: 0.05,
  otherReturn: 0.02,
};
