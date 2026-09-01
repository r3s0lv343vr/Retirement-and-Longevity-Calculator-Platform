import { extraAnnualSavings, inflate } from "@/lib/engine";
import { CHILD_DEFAULT, type ChildInput, type ChildPayload } from "./defaults";

export type { ChildInput, ChildPayload };

const MAX_MONEY = 50_000_000;
const MAX_AGE = 30;
const MAX_RATE = 0.25;
const MAX_WAIT = 40;

type YearSpec = { age: number; cost: number; contribution: number };

export type ChildYearPhase = "before-baby" | "early-years" | "school" | "university";

export const CHILD_PHASE_LABEL: Record<ChildYearPhase, string> = {
  "before-baby": "Before baby",
  "early-years": "Early years",
  school: "School",
  university: "University",
};

/** One calendar year of the current plan — costs and both pots, not the fully funded path. */
export type ChildYearRow = {
  yearFromNow: number;
  childAge: number | null;
  phase: ChildYearPhase;
  living: number;
  school: number;
  extra: number;
  university: number;
  totalCost: number;
  raisingContribution: number;
  universityContribution: number;
  raisingStart: number;
  raisingEnd: number;
  universityStart: number;
  universityEnd: number;
};

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

export type ChildSaveTarget = {
  years: number;
  annualSave: number | null;
  extraAnnualSave: number | null;
  alreadyEnough: boolean;
};

export type ChildSaveSchedule = {
  byBaby: ChildSaveTarget;
  bySchool: ChildSaveTarget;
  byUniversity: ChildSaveTarget;
};

export type ChildReadiness = {
  presentValueThrough18: number;
  livingPresentValue: number;
  schoolPresentValue: number;
  yearsUntilReady: number | null;
  plannedYearsUntilBaby: number;
  readyByPlannedBaby: boolean;
  coversLivingToSchool: boolean;
  coversSchool: boolean;
  salaryDependentSchool: boolean;
  childAlreadyHere: boolean;
};

export type ChildEstimate = {
  input: ChildInput;
  raising: ChildPot;
  university: ChildPot;
  readiness: ChildReadiness;
  combinedNeeded: number;
  combinedHave: number;
  warnings: string[];
  years: ChildYearRow[];
  raisingSave: ChildSaveSchedule;
  universitySave: ChildSaveSchedule;
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
    yearsUntilBaby: asNumber(src.yearsUntilBaby, CHILD_DEFAULT.yearsUntilBaby),
    monthlyChildCostToday: asNumber(src.monthlyChildCostToday, CHILD_DEFAULT.monthlyChildCostToday),
    ageDemandRate: asNumber(src.ageDemandRate, CHILD_DEFAULT.ageDemandRate),
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
    educationInflationRate: asNumber(src.educationInflationRate, CHILD_DEFAULT.educationInflationRate),
    returnRate: asNumber(src.returnRate, CHILD_DEFAULT.returnRate),
  };
}

export function validateChildInput(input: ChildInput): string[] {
  const errors: string[] = [];
  if (input.childAge < 0 || input.childAge > MAX_AGE) errors.push("Child age must be between 0 and 30.");
  if (input.yearsUntilBaby < 0 || input.yearsUntilBaby > 20) {
    errors.push("Years until the baby must be between 0 and 20.");
  }
  if (input.schoolStartAge < 3 || input.schoolStartAge > 12) errors.push("School start age must be between 3 and 12.");
  if (input.universityStartAge < 16 || input.universityStartAge > 25) {
    errors.push("University start age must be between 16 and 25.");
  }
  if (input.universityYears < 1 || input.universityYears > 8) errors.push("University years must be between 1 and 8.");
  if (input.schoolStartAge >= input.universityStartAge) {
    errors.push("School start must be before university start.");
  }
  const money = [
    input.monthlyChildCostToday,
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
  if (input.educationInflationRate < 0 || input.educationInflationRate > MAX_RATE) {
    errors.push("Education inflation must be between 0% and 25%.");
  }
  if (input.returnRate < 0 || input.returnRate > MAX_RATE) errors.push("Return must be between 0% and 25%.");
  if (input.ageDemandRate < 0 || input.ageDemandRate > MAX_RATE) {
    errors.push("Age-related increase must be between 0% and 25%.");
  }
  return errors;
}

export function birthDelay(input: ChildInput): number {
  if (input.childAge > 0) return 0;
  return Math.max(0, Math.round(input.yearsUntilBaby));
}

export function warningsForChild(input: ChildInput, readiness: ChildReadiness): string[] {
  const warnings: string[] = [];
  if (input.childAge >= input.universityStartAge) {
    warnings.push("The child is already at university age, so the raising nest egg is $0.");
  }
  if (input.childAge >= input.universityStartAge + input.universityYears) {
    warnings.push("The modeled university years are already over.");
  }
  if (input.monthlyChildCostToday <= 0 && input.schoolAnnualToday <= 0 && input.extraAnnualToday <= 0) {
    warnings.push("Living, school, and co-curricular are all $0, so the raising nest egg is only what you already save.");
  }
  if (input.universityAnnualToday <= 0) {
    warnings.push("University cost is $0, so that nest egg is only what you already save.");
  }
  if (readiness.salaryDependentSchool) {
    warnings.push(
      "You may be able to have the baby, but there is little in the pot to begin preschool or carry through school. Schooling would depend mainly on salary.",
    );
  }
  if (!readiness.childAlreadyHere && readiness.yearsUntilReady !== null && !readiness.readyByPlannedBaby) {
    warnings.push(
      `At this yearly saving and return, the raising present value is funded in ${readiness.yearsUntilReady} year${readiness.yearsUntilReady === 1 ? "" : "s"}, later than the ${readiness.plannedYearsUntilBaby} year${readiness.plannedYearsUntilBaby === 1 ? "" : "s"} until the baby.`,
    );
  }
  if (!readiness.childAlreadyHere && readiness.yearsUntilReady === null && readiness.presentValueThrough18 > 0) {
    warnings.push("At this yearly saving and return, the raising present value is not reached in 40 years.");
  }
  return warnings;
}

function livingCostAt(input: ChildInput, yearsFromNow: number, childAge: number): number {
  const base = input.monthlyChildCostToday * 12;
  if (base <= 0) return 0;
  return base * (1 + input.inflationRate) ** yearsFromNow * (1 + input.ageDemandRate) ** childAge;
}

function schoolTuitionAt(input: ChildInput, yearsFromNow: number, childAge: number): number {
  if (childAge < input.schoolStartAge) return 0;
  return inflate(input.schoolAnnualToday, input.educationInflationRate, yearsFromNow);
}

function extraCostAt(input: ChildInput, yearsFromNow: number, childAge: number): number {
  if (childAge < input.schoolStartAge) return 0;
  return inflate(input.extraAnnualToday, input.educationInflationRate, yearsFromNow);
}

function schoolCostAt(input: ChildInput, yearsFromNow: number, childAge: number): number {
  return schoolTuitionAt(input, yearsFromNow, childAge) + extraCostAt(input, yearsFromNow, childAge);
}

function phaseFor(input: ChildInput, childAge: number | null): ChildYearPhase {
  if (childAge === null) return "before-baby";
  if (childAge >= input.universityStartAge) return "university";
  if (childAge >= input.schoolStartAge) return "school";
  return "early-years";
}

function buildYearRows(input: ChildInput): ChildYearRow[] {
  const delay = birthDelay(input);
  const uniEnd = input.universityStartAge + input.universityYears;
  const yearsAfterBirth = Math.max(0, uniEnd - input.childAge);
  const endYear = delay + yearsAfterBirth;
  const rate = input.returnRate;
  let raising = input.raisingSavings;
  let university = input.universitySavings;
  const rows: ChildYearRow[] = [];

  for (let yearFromNow = 0; yearFromNow < endYear; yearFromNow += 1) {
    const born = yearFromNow >= delay;
    const childAge = born ? input.childAge + (yearFromNow - delay) : null;
    const inRaising = childAge === null || childAge < input.universityStartAge;
    const inUniversity =
      childAge !== null && childAge >= input.universityStartAge && childAge < uniEnd;
    const living =
      childAge !== null && childAge < input.universityStartAge
        ? livingCostAt(input, yearFromNow, childAge)
        : 0;
    const school =
      childAge !== null && childAge < input.universityStartAge
        ? schoolTuitionAt(input, yearFromNow, childAge)
        : 0;
    const extra =
      childAge !== null && childAge < input.universityStartAge
        ? extraCostAt(input, yearFromNow, childAge)
        : 0;
    const universityCost = inUniversity
      ? inflate(input.universityAnnualToday, input.educationInflationRate, yearFromNow)
      : 0;
    const raisingContribution = inRaising ? input.raisingAnnualSave : 0;
    const universityContribution = inRaising ? input.universityAnnualSave : 0;
    const raisingCost = living + school + extra;
    const raisingStart = raising;
    const universityStart = university;
    const raisingEnd = inRaising
      ? raisingStart * (1 + rate) + raisingContribution - raisingCost
      : raisingStart;
    const universityEnd = universityStart * (1 + rate) + universityContribution - universityCost;
    raising = raisingEnd;
    university = universityEnd;
    rows.push({
      yearFromNow,
      childAge,
      phase: phaseFor(input, childAge),
      living,
      school,
      extra,
      university: universityCost,
      totalCost: living + school + extra + universityCost,
      raisingContribution,
      universityContribution,
      raisingStart,
      raisingEnd,
      universityStart,
      universityEnd,
    });
  }

  return rows;
}

function raisingYears(
  input: ChildInput,
  delay = birthDelay(input),
  includeLiving = true,
  includeSchool = true,
  annualSave = input.raisingAnnualSave,
  cutoff = Number.POSITIVE_INFINITY,
): YearSpec[] {
  const last = input.universityStartAge;
  if (input.childAge >= last) return [];
  const specs: YearSpec[] = [];
  for (let year = 0; year < delay; year += 1) {
    specs.push({ age: -1, cost: 0, contribution: year < cutoff ? annualSave : 0 });
  }
  for (let age = input.childAge; age < last; age += 1) {
    const t = delay + (age - input.childAge);
    const living = includeLiving ? livingCostAt(input, t, age) : 0;
    const school = includeSchool ? schoolCostAt(input, t, age) : 0;
    specs.push({ age, cost: living + school, contribution: t < cutoff ? annualSave : 0 });
  }
  return specs;
}

function universityYears(
  input: ChildInput,
  annualSave = input.universityAnnualSave,
  cutoff = Number.POSITIVE_INFINITY,
): YearSpec[] {
  const delay = birthDelay(input);
  const end = input.universityStartAge + input.universityYears;
  if (input.childAge >= end) return [];
  const specs: YearSpec[] = [];
  for (let year = 0; year < delay; year += 1) {
    specs.push({ age: -1, cost: 0, contribution: year < cutoff ? annualSave : 0 });
  }
  for (let age = input.childAge; age < end; age += 1) {
    const t = delay + (age - input.childAge);
    const inUni = age >= input.universityStartAge;
    const cost = inUni ? inflate(input.universityAnnualToday, input.educationInflationRate, t) : 0;
    const contribution = age < input.universityStartAge && t < cutoff ? annualSave : 0;
    specs.push({ age, cost, contribution });
  }
  return specs;
}

type SaveUntil = "baby" | "school" | "university";

function saveWindowYears(input: ChildInput, until: SaveUntil): number {
  const delay = birthDelay(input);
  if (until === "baby") return delay;
  if (until === "school") return delay + Math.max(0, input.schoolStartAge - input.childAge);
  return delay + Math.max(0, input.universityStartAge - input.childAge);
}

const MAX_ANNUAL_SAVE = 2_000_000;

function minAnnualSave(start: number, makeYears: (save: number) => YearSpec[], rate: number): number | null {
  const empty = makeYears(0);
  if (empty.length === 0) return 0;
  if (potSurvives(start, empty, rate)) return 0;
  let lo = 0;
  let hi = MAX_ANNUAL_SAVE;
  if (!potSurvives(start, makeYears(hi), rate)) return null;
  for (let i = 0; i < 36; i += 1) {
    const mid = (lo + hi) / 2;
    if (potSurvives(start, makeYears(mid), rate)) hi = mid;
    else lo = mid;
  }
  return Math.ceil(hi / 100) * 100;
}

function saveTarget(
  start: number,
  currentSave: number,
  years: number,
  makeYears: (save: number) => YearSpec[],
  rate: number,
): ChildSaveTarget {
  const needed = minAnnualSave(start, makeYears, rate);
  if (needed === null) {
    return { years, annualSave: null, extraAnnualSave: null, alreadyEnough: false };
  }
  if (needed === 0) {
    return { years, annualSave: 0, extraAnnualSave: 0, alreadyEnough: true };
  }
  if (years <= 0) {
    return { years, annualSave: null, extraAnnualSave: null, alreadyEnough: false };
  }
  const extra = Math.max(0, needed - currentSave);
  return {
    years,
    annualSave: needed,
    extraAnnualSave: extra,
    alreadyEnough: extra <= 0,
  };
}

function estimateSaveSchedule(input: ChildInput, kind: "raising" | "university"): ChildSaveSchedule {
  const delay = birthDelay(input);
  const start = kind === "raising" ? input.raisingSavings : input.universitySavings;
  const current = kind === "raising" ? input.raisingAnnualSave : input.universityAnnualSave;
  const rate = input.returnRate;
  const make = (until: SaveUntil) => (save: number) =>
    kind === "raising"
      ? raisingYears(input, delay, true, true, save, saveWindowYears(input, until))
      : universityYears(input, save, saveWindowYears(input, until));
  return {
    byBaby: saveTarget(start, current, saveWindowYears(input, "baby"), make("baby"), rate),
    bySchool: saveTarget(start, current, saveWindowYears(input, "school"), make("school"), rate),
    byUniversity: saveTarget(start, current, saveWindowYears(input, "university"), make("university"), rate),
  };
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
  const costYears = years.filter((y) => y.cost > 0 && y.age >= 0);
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

function yearsUntilRaisingReady(input: ChildInput): number | null {
  if (input.childAge > 0) return null;
  const probe = { ...input, childAge: 0 };
  for (let delay = 0; delay <= MAX_WAIT; delay += 1) {
    const years = raisingYears({ ...probe, yearsUntilBaby: delay }, delay, true, true);
    if (potSurvives(input.raisingSavings, years, input.returnRate)) return delay;
  }
  return null;
}

function estimateReadiness(input: ChildInput, raising: ChildPot): ChildReadiness {
  const delay = birthDelay(input);
  const living = nestEggNeeded(raisingYears(input, delay, true, false), input.returnRate);
  const school = nestEggNeeded(raisingYears(input, delay, false, true), input.returnRate);
  const childAlreadyHere = input.childAge > 0;
  const yearsUntilReady = yearsUntilRaisingReady(input);
  const planned = delay;
  const depleted = raising.depletedAtAge;
  const coversLivingToSchool = depleted === null || depleted >= input.schoolStartAge;
  const coversSchool = depleted === null;
  const salaryDependentSchool =
    !coversSchool &&
    (input.schoolAnnualToday > 0 || input.extraAnnualToday > 0) &&
    (input.monthlyChildCostToday > 0 || coversLivingToSchool || (depleted !== null && depleted <= input.schoolStartAge));

  return {
    presentValueThrough18: raising.nestEggNeededNow,
    livingPresentValue: living,
    schoolPresentValue: school,
    yearsUntilReady,
    plannedYearsUntilBaby: planned,
    readyByPlannedBaby: childAlreadyHere ? raising.alreadyEnough : yearsUntilReady !== null && yearsUntilReady <= planned,
    coversLivingToSchool,
    coversSchool,
    salaryDependentSchool,
    childAlreadyHere,
  };
}

/** Living costs through 18 (age + inflation), school as its own slice, then university. */
export function estimateChild(input: ChildInput): ChildEstimate {
  const delay = birthDelay(input);
  const yearsToSave = delay + Math.max(0, input.universityStartAge - input.childAge);
  const raising = estimatePot(input.raisingSavings, yearsToSave, raisingYears(input), input.returnRate);
  const university = estimatePot(
    input.universitySavings,
    yearsToSave,
    universityYears(input),
    input.returnRate,
  );
  const raisingSave = estimateSaveSchedule(input, "raising");
  const universitySave = estimateSaveSchedule(input, "university");
  if (raisingSave.byUniversity.extraAnnualSave !== null) {
    raising.additionalAnnualSavings = raisingSave.byUniversity.extraAnnualSave;
  }
  if (universitySave.byUniversity.extraAnnualSave !== null) {
    university.additionalAnnualSavings = universitySave.byUniversity.extraAnnualSave;
  }
  const readiness = estimateReadiness(input, raising);
  const years = buildYearRows(input);
  return {
    input,
    raising,
    university,
    readiness,
    combinedNeeded: raising.nestEggNeededNow + university.nestEggNeededNow,
    combinedHave: input.raisingSavings + input.universitySavings,
    warnings: warningsForChild(input, readiness),
    years,
    raisingSave,
    universitySave,
  };
}
