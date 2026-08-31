import {
  nestEggBreakdown,
  planIsFunded,
  projectBase,
  validateInput,
  warningsFor,
} from "@/lib/engine";
import type { CalculatorInput } from "@/lib/engine";

export const MIN_WORK_END_AGE = 40;
export const MAX_WORK_END_AGE = 90;

export type WorkEndEstimate = {
  input: CalculatorInput;
  solvedInput: CalculatorInput;
  workEndAge: number | null;
  yearsOfWork: number;
  canStopNow: boolean;
  cannotFund: boolean;
  nestEggAtWorkEnd: number;
  fundedThroughIfStopThen: number;
  warnings: string[];
};

export function workEndSearchBounds(input: CalculatorInput): { minAge: number; maxAge: number } {
  const minAge = Math.max(MIN_WORK_END_AGE, Math.round(input.currentAge));
  const maxAge = Math.min(MAX_WORK_END_AGE, Math.round(input.planToAge));
  return { minAge, maxAge: Math.max(minAge, maxAge) };
}

export function inputAtWorkEnd(input: CalculatorInput, workEndAge: number): CalculatorInput {
  return { ...input, retirementAge: workEndAge };
}

/** Validate the form fields. Submitted work-end is ignored; this tool solves for it. */
export function validateWhenInput(input: CalculatorInput): string[] {
  const { minAge } = workEndSearchBounds(input);
  const goGoEndAge = Math.max(input.goGoEndAge, minAge);
  const slowGoEndAge = Math.max(input.slowGoEndAge, goGoEndAge + 1);
  return validateInput({ ...input, retirementAge: minAge, goGoEndAge, slowGoEndAge });
}

/** Earliest full-time work-end that funds the entered plan through the plan-through age. */
export function estimateWorkEnd(input: CalculatorInput): WorkEndEstimate {
  const { minAge, maxAge } = workEndSearchBounds(input);
  let workEndAge: number | null = null;
  for (let age = minAge; age <= maxAge; age += 1) {
    if (planIsFunded(inputAtWorkEnd(input, age))) {
      workEndAge = age;
      break;
    }
  }
  const cannotFund = workEndAge == null;
  const usedAge = workEndAge ?? maxAge;
  const solvedInput = inputAtWorkEnd(input, usedAge);
  const run = projectBase(solvedInput);
  const nest = nestEggBreakdown(solvedInput);
  return {
    input,
    solvedInput,
    workEndAge,
    yearsOfWork: Math.max(0, usedAge - Math.round(input.currentAge)),
    canStopNow: workEndAge != null && workEndAge <= input.currentAge,
    cannotFund,
    nestEggAtWorkEnd: nest.total,
    fundedThroughIfStopThen: run.outlook.fundedThroughAge,
    warnings: warningsFor(solvedInput),
  };
}
