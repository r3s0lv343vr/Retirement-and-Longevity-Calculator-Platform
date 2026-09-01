import { inflate } from "@/lib/engine";
import { GOAL_DEFAULT, type GoalInput, type GoalPayload } from "./defaults";

export type { GoalInput, GoalPayload };

const MAX_MONEY = 50_000_000;
const MAX_YEARS = 40;
const MAX_RATE = 0.25;
const MAX_NAME = 80;

export type GoalStatus = "intact" | "short" | "reached_raided" | "compromised" | "dissolved";

export type GoalEstimate = {
  input: GoalInput;
  status: GoalStatus;
  neededAtTarget: number;
  endingGoal: number;
  endingOther: number;
  intendedEndingGoal: number;
  goalShortfall: number;
  firstYearDippedOther: number | null;
  firstYearDippedGoal: number | null;
  yearGoalDepleted: number | null;
  dippedGoal: boolean;
  dippedOther: boolean;
  reachedGoal: boolean;
  warnings: string[];
};

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asName(value: unknown, fallback: string): string {
  if (typeof value === "string") return value.trim().slice(0, MAX_NAME);
  return fallback;
}

export function mergeGoalInput(payload: GoalPayload | null | undefined): GoalInput {
  const src = payload ?? {};
  return {
    goalName: asName(src.goalName, GOAL_DEFAULT.goalName),
    goalAmountToday: asNumber(src.goalAmountToday, GOAL_DEFAULT.goalAmountToday),
    yearsToGoal: asNumber(src.yearsToGoal, GOAL_DEFAULT.yearsToGoal),
    goalSavings: asNumber(src.goalSavings, GOAL_DEFAULT.goalSavings),
    plannedAnnualToGoal: asNumber(src.plannedAnnualToGoal, GOAL_DEFAULT.plannedAnnualToGoal),
    annualIncome: asNumber(src.annualIncome, GOAL_DEFAULT.annualIncome),
    annualExpenses: asNumber(src.annualExpenses, GOAL_DEFAULT.annualExpenses),
    otherSavings: asNumber(src.otherSavings, GOAL_DEFAULT.otherSavings),
    inflationRate: asNumber(src.inflationRate, GOAL_DEFAULT.inflationRate),
    goalReturn: asNumber(src.goalReturn, GOAL_DEFAULT.goalReturn),
    otherReturn: asNumber(src.otherReturn, GOAL_DEFAULT.otherReturn),
  };
}

export function validateGoalInput(input: GoalInput): string[] {
  const errors: string[] = [];
  if (input.yearsToGoal < 1 || input.yearsToGoal > MAX_YEARS) {
    errors.push("Years until the goal must be between 1 and 40.");
  }
  const money = [
    input.goalAmountToday,
    input.goalSavings,
    input.plannedAnnualToGoal,
    input.annualIncome,
    input.annualExpenses,
    input.otherSavings,
  ];
  if (money.some((n) => n < 0 || n > MAX_MONEY)) errors.push("Dollar amounts must be between $0 and $50,000,000.");
  if (input.inflationRate < 0 || input.inflationRate > MAX_RATE) errors.push("Inflation must be between 0% and 25%.");
  if (input.goalReturn < 0 || input.goalReturn > MAX_RATE) errors.push("Goal return must be between 0% and 25%.");
  if (input.otherReturn < 0 || input.otherReturn > MAX_RATE) {
    errors.push("Other-savings return must be between 0% and 25%.");
  }
  return errors;
}

export function warningsForGoal(input: GoalInput): string[] {
  const warnings: string[] = [];
  if (input.annualExpenses > input.annualIncome) {
    warnings.push("Yearly expenses are higher than income, so the model will dip into savings.");
  }
  if (input.goalAmountToday <= 0) warnings.push("The goal amount is $0.");
  if (input.plannedAnnualToGoal <= 0 && input.goalSavings <= 0) {
    warnings.push("Nothing is earmarked and nothing is planned to add, so the goal pot stays empty.");
  }
  return warnings;
}

type RunResult = {
  endingGoal: number;
  endingOther: number;
  firstYearDippedOther: number | null;
  firstYearDippedGoal: number | null;
  yearGoalDepleted: number | null;
};

function runPath(input: GoalInput, raid: boolean): RunResult {
  let goal = input.goalSavings;
  let other = input.otherSavings;
  let firstYearDippedOther: number | null = null;
  let firstYearDippedGoal: number | null = null;
  let yearGoalDepleted: number | null = null;

  for (let year = 1; year <= input.yearsToGoal; year += 1) {
    const t = year - 1;
    const income = inflate(input.annualIncome, input.inflationRate, t);
    const expenses = inflate(input.annualExpenses, input.inflationRate, t);
    const cash = income - expenses;

    if (!raid) {
      goal += input.plannedAnnualToGoal;
    } else if (cash >= input.plannedAnnualToGoal) {
      goal += input.plannedAnnualToGoal;
      other += cash - input.plannedAnnualToGoal;
    } else if (cash >= 0) {
      goal += cash;
    } else {
      let need = -cash;
      const fromOther = Math.min(other, need);
      if (fromOther > 0) {
        other -= fromOther;
        need -= fromOther;
        if (firstYearDippedOther === null) firstYearDippedOther = year;
      }
      if (need > 0) {
        const fromGoal = Math.min(goal, need);
        if (fromGoal > 0) {
          goal -= fromGoal;
          if (firstYearDippedGoal === null) firstYearDippedGoal = year;
        }
      }
    }

    if (goal <= 0.5) {
      goal = Math.max(0, goal);
      if (yearGoalDepleted === null && (input.goalSavings > 0 || year > 1 || firstYearDippedGoal !== null)) {
        yearGoalDepleted = year;
      }
    }

    goal *= 1 + input.goalReturn;
    other *= 1 + input.otherReturn;
    if (goal < 0.5) goal = 0;
    if (other < 0.5) other = 0;
  }

  return { endingGoal: goal, endingOther: other, firstYearDippedOther, firstYearDippedGoal, yearGoalDepleted };
}

function statusFor(reached: boolean, dippedGoal: boolean, dissolved: boolean): GoalStatus {
  if (dissolved) return "dissolved";
  if (dippedGoal && reached) return "reached_raided";
  if (dippedGoal) return "compromised";
  if (reached) return "intact";
  return "short";
}

/** Whether competing expenses raid other savings, then the earmarked goal pot, before the target year. */
export function estimateGoal(input: GoalInput): GoalEstimate {
  const neededAtTarget = inflate(input.goalAmountToday, input.inflationRate, input.yearsToGoal);
  const lived = runPath(input, true);
  const intended = runPath(input, false);
  const dippedGoal = lived.firstYearDippedGoal !== null;
  const dippedOther = lived.firstYearDippedOther !== null;
  const dissolved = lived.yearGoalDepleted !== null || (dippedGoal && lived.endingGoal <= 0.5);
  const reachedGoal = lived.endingGoal + 0.5 >= neededAtTarget && neededAtTarget > 0;
  const reachedEmptyGoal = neededAtTarget <= 0 && lived.endingGoal >= 0;

  return {
    input,
    status: statusFor(reachedGoal || reachedEmptyGoal, dippedGoal, dissolved && !reachedGoal),
    neededAtTarget,
    endingGoal: lived.endingGoal,
    endingOther: lived.endingOther,
    intendedEndingGoal: intended.endingGoal,
    goalShortfall: Math.max(0, neededAtTarget - lived.endingGoal),
    firstYearDippedOther: lived.firstYearDippedOther,
    firstYearDippedGoal: lived.firstYearDippedGoal,
    yearGoalDepleted: lived.yearGoalDepleted,
    dippedGoal,
    dippedOther,
    reachedGoal: reachedGoal || reachedEmptyGoal,
    warnings: warningsForGoal(input),
  };
}
