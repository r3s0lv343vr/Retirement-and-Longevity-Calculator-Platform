import { projectBase, warningsFor } from "@/lib/engine";
import type { CalculatorInput } from "@/lib/engine";

export type ClaimLonger = 67 | 70 | "same";

export type ClaimEstimate = {
  input: CalculatorInput;
  enteredAnnual: number;
  enteredStartAge: number;
  claiming67Annual: number;
  claiming70Annual: number;
  claiming67FundedThroughAge: number;
  claiming70FundedThroughAge: number;
  fundedThroughDelta: number;
  longerClaim: ClaimLonger;
  warnings: string[];
};

function longerClaim(age67: number, age70: number): ClaimLonger {
  if (age70 > age67) return 70;
  if (age67 > age70) return 67;
  return "same";
}

/** Same 67 vs 70 numbers as the compare card on How long. One short run. */
export function estimateClaim(input: CalculatorInput): ClaimEstimate {
  const result = projectBase(input);
  const { outlook } = result;
  const warnings = [...warningsFor(input)];
  if (input.socialSecurityAnnual <= 0) {
    warnings.unshift("Social Security is $0, so both claim ages look the same in this model.");
  }
  return {
    input,
    enteredAnnual: input.socialSecurityAnnual,
    enteredStartAge: input.socialSecurityStartAge,
    claiming67Annual: outlook.claiming67Annual,
    claiming70Annual: outlook.claiming70Annual,
    claiming67FundedThroughAge: outlook.claiming67FundedThroughAge,
    claiming70FundedThroughAge: outlook.claiming70FundedThroughAge,
    fundedThroughDelta: outlook.claiming70FundedThroughAge - outlook.claiming67FundedThroughAge,
    longerClaim: longerClaim(outlook.claiming67FundedThroughAge, outlook.claiming70FundedThroughAge),
    warnings,
  };
}
