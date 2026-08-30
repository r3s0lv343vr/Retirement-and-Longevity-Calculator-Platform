import { FIELD_META } from "./defaults";
import { projectBase } from "./project";
import type { CalculatorInput, Outlook, PlanSnapshot } from "./types";
import { validateInput } from "./validate";

export const WHAT_IF_LEVERS = [
  "retirementAge",
  "socialSecurityStartAge",
  "pensionCola",
  "healthcareInflationRate",
] as const;

export type WhatIfLever = (typeof WHAT_IF_LEVERS)[number];

export type WhatIfSnapshot = PlanSnapshot;

export type WhatIfComparison = {
  lever: WhatIfLever;
  input: CalculatorInput;
  errors: string[];
  sameAsBaseline: boolean;
  changeLabel: string;
  baseline: WhatIfSnapshot;
  variant: WhatIfSnapshot | null;
  fundedThroughDelta: number | null;
};

export const WHAT_IF_LEVER_COPY: Record<WhatIfLever, { chip: string; hint: string }> = {
  retirementAge: {
    chip: "Retire later",
    hint: "Changes only when full-time work ends. Nest egg years and the retirement window both move.",
  },
  socialSecurityStartAge: {
    chip: "Delay Social Security",
    hint: "Changes only the start age. The annual benefit stays the amount you entered; this model does not raise the check for claiming later.",
  },
  pensionCola: {
    chip: "Pension COLA",
    hint: "Turns COLA on or off for the pension on this run. If pension is $0, the outlook will not change.",
  },
  healthcareInflationRate: {
    chip: "Healthcare inflation",
    hint: "Raises or lowers only the medical inflation rate on this entered plan.",
  },
};

export function applyWhatIf(
  baseline: CalculatorInput,
  lever: WhatIfLever,
  value: CalculatorInput[WhatIfLever],
): CalculatorInput {
  return { ...baseline, [lever]: value };
}

export function suggestedWhatIfValue(
  baseline: CalculatorInput,
  lever: WhatIfLever,
): CalculatorInput[WhatIfLever] {
  if (lever === "retirementAge") {
    return baseline.retirementAge === 67 ? Math.min(90, baseline.retirementAge + 2) : 67;
  }
  if (lever === "socialSecurityStartAge") {
    return baseline.socialSecurityStartAge === 70 ? 67 : 70;
  }
  if (lever === "pensionCola") {
    return !baseline.pensionCola;
  }
  const raised = Math.round((baseline.healthcareInflationRate + 0.01) * 10_000) / 10_000;
  return Math.min(0.25, raised);
}

export function formatWhatIfValue(lever: WhatIfLever, value: CalculatorInput[WhatIfLever]): string {
  const kind = FIELD_META[lever].kind;
  if (kind === "toggle") return value ? "On" : "Off";
  if (kind === "percent") return `${(Number(value) * 100).toFixed(1)}%`;
  return String(value);
}

export function whatIfChangeLabel(
  baseline: CalculatorInput,
  lever: WhatIfLever,
  value: CalculatorInput[WhatIfLever],
): string {
  return `${FIELD_META[lever].label}: ${formatWhatIfValue(lever, baseline[lever])} → ${formatWhatIfValue(lever, value)}`;
}

export function snapshotFromOutlook(outlook: Outlook): WhatIfSnapshot {
  return {
    fundedThroughAge: outlook.fundedThroughAge,
    yearsCovered: outlook.yearsCovered,
    yearsInRetirement: outlook.yearsInRetirement,
    depleted: outlook.depleted,
    endingBalance: outlook.endingBalance,
    remainingSavings: outlook.remainingSavings,
    remainingExpenseNeed: outlook.remainingExpenseNeed,
    requiredMonths: outlook.requiredMonths,
    accumulatedMonths: outlook.accumulatedMonths,
  };
}

export function compareWhatIf(
  baseline: CalculatorInput,
  baselineOutlook: Outlook,
  lever: WhatIfLever,
  value: CalculatorInput[WhatIfLever],
): WhatIfComparison {
  const input = applyWhatIf(baseline, lever, value);
  const sameAsBaseline = baseline[lever] === value;
  const changeLabel = whatIfChangeLabel(baseline, lever, value);
  const snapshot = snapshotFromOutlook(baselineOutlook);
  const errors = validateInput(input);
  if (errors.length > 0) {
    return {
      lever,
      input,
      errors,
      sameAsBaseline,
      changeLabel,
      baseline: snapshot,
      variant: null,
      fundedThroughDelta: null,
    };
  }
  const variantOutlook = sameAsBaseline ? baselineOutlook : projectBase(input).outlook;
  const variant = snapshotFromOutlook(variantOutlook);
  return {
    lever,
    input,
    errors: [],
    sameAsBaseline,
    changeLabel,
    baseline: snapshot,
    variant,
    fundedThroughDelta: variant.fundedThroughAge - snapshot.fundedThroughAge,
  };
}

export function fundedThroughDeltaCopy(delta: number): string {
  if (delta === 0) return "Same funded-through age as this run.";
  const years = Math.abs(delta);
  const unit = years === 1 ? "year" : "years";
  return delta > 0
    ? `Lasts ${years} ${unit} longer than this run.`
    : `Runs out ${years} ${unit} sooner than this run.`;
}
