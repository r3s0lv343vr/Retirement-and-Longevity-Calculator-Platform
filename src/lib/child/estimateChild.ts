import { extraAnnualSavings, inflate } from "@/lib/engine";
import { CHILD_DEFAULT, type ChildInput, type ChildPayload } from "./defaults";

export type { ChildInput, ChildPayload };

const MAX_MONEY = 50_000_000;
const MAX_AGE = 30;
const MAX_RATE = 0.25;

type YearSpec = { age: number; cost: number; contribution: number };

export type ChildPot = {
  nestEggNeededNow: number;
  additionalNestEgg: number;
  additionalAnnualSavings: number;
  yearsToSave: number;
  alreadyEnough: boolean;
  endingWithWhatYouHave: number;
  depletedAtAge: number | null;
  costYears: number;
  firstCostAge: number | null;
  lastCostAge: number | null;
};

export type ChildEstimate = {
  input: ChildInput;
  raising: ChildPot;
  university: ChildPot;
  combinedNeeded: number;
  combinedHave: number;
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

export function mergeChildInput(payload: ChildPayload | null | undefined): ChildInput {
  const src = payload ?? {};
  return {
    childAge: asNumber(src.childAge, CHILD_DEFAULT.childAge),
    schoolStartAge: asNumber(src.schoolStartAge, CHILD_DEFAULT.schoolStartAge),
    schoolAnnualToday: asNumber(src.schoolAnnualToday, CHILD_DEFAULT.schoolAnnualToday),
    extraAnnualToday: asNumber(src.extraAnnualToday, CHILD_DEFAULT.extraAnnualToday),
    raisingSavings: asNumber(src.raisingSavings, CHILD_DEFAULT.raisingSavings),
    raisingAnnualSave: asNumber(src.raisingAnnualSave, CHILD_DEFAULT.raisingAnnualSave),
    universityStartAge: asNumber(src.universityStartAge, CHILD_DEFAULT.universityStartAge),
    universityYears: asNumber(src.universityYears, CHILD_DEFAULT.universityYears),
    universityAnnualToday: asNumber(src.universityAnnualToday, CHILD_DEFAULT.universityAnnualToday),
    universitySavings: asNumber(src.universitySavings, CHILD_DEFAULT.universitySavings),
    universityAnnualSave: asNumber(src.universityAnnualSave, CHILD_DEFAULT.universityAnnualSave),
    inflationRate: asNumber(src.inflationRate, CHILD_DEFAULT.inflationRate),
    returnRate: asNumber(src.returnRate, CHILD_DEFAULT.returnRate),
  };
}

export function validateChildInput(input: ChildInput): string[] {
  const errors: string[] = [];
  if (input.childAge < 0 || input.childAge > MAX_AGE) errors.push("Child age must be between 0 and 30.");
  if (input.schoolStartAge < 3 || input.schoolStartAge > 12) errors.push("School start age must be between 3 and 12.");
  if (input.universityStartAge < 16 || input.universityStartAge > 25) {
    errors.push("University start age must be between 16 and 25.");
  }
  if (input.universityYears < 1 || input.universityYears > 8) errors.push("University years must be between 1 and 8.");
  if (input.schoolStartAge >= input.universityStartAge) {
    errors.push("School start must be before university start.");
  }
  const money = [
    input.schoolAnnualToday,
    input.extraAnnualToday,
    input.raisingSavings,
    input.raisingAnnualSave,
    input.universityAnnualToday,
    input.universitySavings,
    input.universityAnnualSave,
  ];
  if (money.some((n) => n < 0 || n > MAX_MONEY)) errors.push("Dollar amounts must be between $0 and $50,000,000.");
  if (input.inflationRate < 0 || input.inflationRate > MAX_RATE) errors.push("Inflation must be between 0% and 25%.");
  if (input.returnRate < 0 || input.returnRate > MAX_RATE) errors.push("Return must be between 0% and 25%.");
  return errors;
}

export function warningsForChild(input: ChildInput): string[] {
  const warnings: string[] = [];
  if (input.childAge >= input.universityStartAge) {
    warnings.push("The child is already at university age, so the raising nest egg is $0.");
  }
  if (input.childAge >= input.universityStartAge + input.universityYears) {
    warnings.push("The modeled university years are already over.");
  }
  if (input.schoolAnnualToday <= 0 && input.extraAnnualToday <= 0) {
    warnings.push("School and co-curricular are both $0, so the raising nest egg is only what you already save.");
  }
  if (input.universityAnnualToday <= 0) {
    warnings.push("University cost is $0, so that nest egg is only what you already save.");
  }
  return warnings;
}

function raisingYears(input: ChildInput): YearSpec[] {
  const last = input.universityStartAge;
  if (input.childAge >= last) return [];
  const specs: YearSpec[] = [];
  for (let age = input.childAge; age < last; age += 1) {
    const t = age - input.childAge;
    const inSchool = age >= input.schoolStartAge;
    const cost = inSchool ? inflate(input.schoolAnnualToday + input.extraAnnualToday, input.inflationRate, t) : 0;
    specs.push({ age, cost, contribution: input.raisingAnnualSave });
  }
  return specs;
}

function universityYears(input: ChildInput): YearSpec[] {
  const end = input.universityStartAge + input.universityYears;
  if (input.childAge >= end) return [];
  const specs: YearSpec[] = [];
  for (let age = input.childAge; age < end; age += 1) {
    const t = age - input.childAge;
    const inUni = age >= input.universityStartAge;
    const cost = inUni ? inflate(input.universityAnnualToday, input.inflationRate, t) : 0;
    const contribution = age < input.universityStartAge ? input.universityAnnualSave : 0;
    specs.push({ age, cost, contribution });
  }
  return specs;
}

function projectPot(
  start: number,
  years: YearSpec[],
  rate: number,
): { ending: number; depletedAtAge: number | null } {
  let balance = start;
  let depletedAtAge: number | null = null;
  for (const year of years) {
    balance = balance * (1 + rate) + year.contribution - year.cost;
    if (balance < -0.5 && depletedAtAge === null) depletedAtAge = year.age;
  }
  return { ending: balance, depletedAtAge };
}

function potSurvives(start: number, years: YearSpec[], rate: number): boolean {
  return projectPot(start, years, rate).depletedAtAge === null;
}

function nestEggNeeded(years: YearSpec[], rate: number): number {
  if (years.length === 0 || potSurvives(0, years, rate)) return 0;
  let lo = 0;
  let hi = 25_000_000;
  if (!potSurvives(hi, years, rate)) return hi;
  for (let i = 0; i < 36; i += 1) {
    const mid = (lo + hi) / 2;
    if (potSurvives(mid, years, rate)) hi = mid;
    else lo = mid;
  }
  return Math.ceil(hi / 100) * 100;
}

function costWindow(years: YearSpec[]): { costYears: number; firstCostAge: number | null; lastCostAge: number | null } {
  const costYears = years.filter((y) => y.cost > 0);
  return {
    costYears: costYears.length,
    firstCostAge: costYears[0]?.age ?? null,
    lastCostAge: costYears[costYears.length - 1]?.age ?? null,
  };
}

function estimatePot(startSavings: number, yearsToSave: number, years: YearSpec[], rate: number): ChildPot {
  const needed = nestEggNeeded(years, rate);
  const additionalNestEgg = Math.max(0, needed - startSavings);
  const projected = projectPot(startSavings, years, rate);
  const window = costWindow(years);
  return {
    nestEggNeededNow: needed,
    additionalNestEgg,
    additionalAnnualSavings: extraAnnualSavings(additionalNestEgg, yearsToSave, rate),
    yearsToSave,
    alreadyEnough: additionalNestEgg <= 0,
    endingWithWhatYouHave: projected.ending,
    depletedAtAge: projected.depletedAtAge,
    ...window,
  };
}

/** Two independent pots: school + co-curricular through university start, then university years. */
export function estimateChild(input: ChildInput): ChildEstimate {
  const raising = estimatePot(
    input.raisingSavings,
    Math.max(0, input.universityStartAge - input.childAge),
    raisingYears(input),
    input.returnRate,
  );
  const university = estimatePot(
    input.universitySavings,
    Math.max(0, input.universityStartAge - input.childAge),
    universityYears(input),
    input.returnRate,
  );
  return {
    input,
    raising,
    university,
    combinedNeeded: raising.nestEggNeededNow + university.nestEggNeededNow,
    combinedHave: input.raisingSavings + input.universitySavings,
    warnings: warningsForChild(input),
  };
}
