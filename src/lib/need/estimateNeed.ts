import { extraAnnualSavings, nestEggNeededNow, nestEggYears, projectBase, warningsFor } from "@/lib/engine";
import type { CalculatorInput } from "@/lib/engine";

export type NeedEstimate = {
  input: CalculatorInput;
  nestEggNeededNow: number;
  additionalNestEgg: number;
  additionalAnnualSavings: number;
  yearsToRetirement: number;
  fundedThroughIfFunded: number;
  alreadyEnough: boolean;
  warnings: string[];
};

/** Nest egg today that funds the entered plan through the plan-through age. Not the comfort budget. */
export function estimateNeed(input: CalculatorInput): NeedEstimate {
  const nestEggNeeded = nestEggNeededNow(input);
  const additionalNestEgg = Math.max(0, nestEggNeeded - input.currentSavings);
  const yearsToRetirement = nestEggYears(input);
  const additionalAnnualSavings = extraAnnualSavings(
    additionalNestEgg,
    yearsToRetirement,
    input.preRetirementReturn,
  );
  const funded = projectBase({
    ...input,
    currentSavings: Math.max(input.currentSavings, nestEggNeeded),
  });
  return {
    input,
    nestEggNeededNow: nestEggNeeded,
    additionalNestEgg,
    additionalAnnualSavings,
    yearsToRetirement,
    fundedThroughIfFunded: funded.outlook.fundedThroughAge,
    alreadyEnough: additionalNestEgg <= 0,
    warnings: warningsFor(input),
  };
}
