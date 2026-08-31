import { nestEggNeededNow, projectBase, validateInput, warningsFor } from "@/lib/engine";
import type { CalculatorInput } from "@/lib/engine";

export type HousingPathId = "home" | "ccrc" | "nursing";

export type HousingPath = {
  id: HousingPathId;
  fundedThroughAge: number;
  nestEggNeededNow: number;
  totalHousingSpend: number;
  rentToday: number;
  startAge: number | null;
  input: CalculatorInput;
};

export type HousingEstimate = {
  input: CalculatorInput;
  home: HousingPath;
  ccrc: HousingPath;
  nursing: HousingPath;
  longest: HousingPathId | "tie";
  warnings: string[];
};

export function inputAtStayHome(input: CalculatorInput): CalculatorInput {
  return {
    ...input,
    seniorHomeRentAnnual: 0,
    nursingHomeRentAnnual: 0,
    ccrcRentAnnual: 0,
  };
}

export function inputAtCcrc(input: CalculatorInput): CalculatorInput {
  return {
    ...input,
    seniorHomeRentAnnual: 0,
    nursingHomeRentAnnual: 0,
  };
}

export function inputAtNursing(input: CalculatorInput): CalculatorInput {
  return {
    ...input,
    seniorHomeRentAnnual: 0,
    ccrcRentAnnual: 0,
  };
}

/** Validate the plan fields. Facility rents are compared as exclusive paths, not stacked. */
export function validateHousingInput(input: CalculatorInput): string[] {
  return validateInput(inputAtStayHome(input));
}

function pathFrom(
  id: HousingPathId,
  input: CalculatorInput,
  rentToday: number,
  startAge: number | null,
): HousingPath {
  const result = projectBase(input);
  return {
    id,
    fundedThroughAge: result.outlook.fundedThroughAge,
    nestEggNeededNow: nestEggNeededNow(input),
    totalHousingSpend: result.outlook.totalHousingSpend,
    rentToday,
    startAge,
    input,
  };
}

function longestPath(home: HousingPath, ccrc: HousingPath, nursing: HousingPath): HousingPathId | "tie" {
  const paths = [home, ccrc, nursing];
  const max = Math.max(...paths.map((p) => p.fundedThroughAge));
  const winners = paths.filter((p) => p.fundedThroughAge === max);
  return winners.length === 1 ? winners[0].id : "tie";
}

/** Three exclusive later-life housing runs. Stay home, CCRC, or nursing — not stacked on one form. */
export function estimateHousing(input: CalculatorInput): HousingEstimate {
  const homeInput = inputAtStayHome(input);
  const ccrcInput = inputAtCcrc(input);
  const nursingInput = inputAtNursing(input);
  const home = pathFrom("home", homeInput, 0, null);
  const ccrc = pathFrom("ccrc", ccrcInput, input.ccrcRentAnnual, input.ccrcStartAge);
  const nursing = pathFrom("nursing", nursingInput, input.nursingHomeRentAnnual, input.nursingHomeStartAge);
  const warnings = [...warningsFor(homeInput)];
  if (input.ccrcRentAnnual <= 0) {
    warnings.unshift("CCRC rent is $0, so that path matches stay home.");
  }
  if (input.nursingHomeRentAnnual <= 0) {
    warnings.unshift("Nursing rent is $0, so that path matches stay home.");
  }
  return {
    input,
    home,
    ccrc,
    nursing,
    longest: longestPath(home, ccrc, nursing),
    warnings,
  };
}
