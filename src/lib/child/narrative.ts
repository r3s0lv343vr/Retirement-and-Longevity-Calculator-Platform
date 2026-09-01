import { formatMoney, formatPercent } from "@/lib/format";
import {
  CHILD_PHASE_LABEL,
  type ChildEstimate,
  type ChildPot,
  type ChildReadiness,
  type ChildYearRow,
} from "./estimateChild";

export function readinessHeadline(readiness: ChildReadiness): string {
  if (readiness.childAlreadyHere && readiness.coversSchool) {
    return "The raising pot funds living and school through 18";
  }
  if (readiness.yearsUntilReady === 0) {
    return "At this saving rate you are ready for a baby now";
  }
  if (readiness.yearsUntilReady !== null) {
    return `At this saving rate you are ready for a baby in ${readiness.yearsUntilReady} year${readiness.yearsUntilReady === 1 ? "" : "s"}`;
  }
  if (readiness.salaryDependentSchool) {
    return "The baby may be possible; school years would depend mainly on salary";
  }
  if (readiness.childAlreadyHere) {
    return "The remaining raising path is not funded at this saving rate";
  }
  return "This yearly saving does not reach the raising present value in 40 years";
}

export function potNote(pot: ChildPot, saveLabel: string): string {
  if (pot.costYears <= 0) return "No remaining cost years on this pot.";
  const window = `Ages ${pot.firstCostAge}-${pot.lastCostAge} (${pot.costYears} year${pot.costYears === 1 ? "" : "s"}).`;
  if (pot.alreadyEnough) return `${window} What you have is enough in this model.`;
  if (pot.yearsToSave <= 0) return `${window} Full-time saving years are over, so this is a nest-egg gap.`;
  return `${window} Extra yearly saving ${saveLabel} would close the gap.`;
}

function yearsWord(n: number): string {
  return `${n} year${n === 1 ? "" : "s"}`;
}

function yearWhen(yearFromNow: number): string {
  if (yearFromNow <= 0) return "this year";
  return `in ${yearsWord(yearFromNow)}`;
}

function findAge(years: ChildYearRow[], age: number): ChildYearRow | undefined {
  return years.find((row) => row.childAge === age);
}

/** Shared numbered train of thought for the on-page report and the PDF. */
export function buildChildNarrative(result: ChildEstimate): string[] {
  const { input, readiness, raising, university, years } = result;
  const yearOneLiving = input.monthlyChildCostToday * 12;
  const steps: string[] = [];

  steps.push(
    `Year-one living is monthly cost x 12: ${formatMoney(input.monthlyChildCostToday)} x 12 = ${formatMoney(yearOneLiving)} in today's dollars. That is food, care, and ordinary living -- not school.`,
  );

  steps.push(
    `That living stream grows with inflation (${formatPercent(input.inflationRate)}) and an age-related increase (${formatPercent(input.ageDemandRate)}) until university starts at age ${input.universityStartAge}. Each year the child is older, the same household spends more on them.`,
  );

  const ageTen = findAge(years, 10);
  if (ageTen) {
    steps.push(
      `Example: at age 10 (${yearWhen(ageTen.yearFromNow)}), living has grown to ${formatMoney(ageTen.living)}.`,
    );
  } else {
    const firstLiving = years.find((row) => row.living > 0);
    if (firstLiving && firstLiving.childAge !== null) {
      steps.push(
        `Example: at age ${firstLiving.childAge} (${yearWhen(firstLiving.yearFromNow)}), living is ${formatMoney(firstLiving.living)}.`,
      );
    }
  }

  steps.push(
    `School (${formatMoney(input.schoolAnnualToday)} today) and co-curricular extras (${formatMoney(input.extraAnnualToday)} today) begin at age ${input.schoolStartAge} and rise with inflation only. They sit on the raising pot, not on a third nest egg.`,
  );

  const firstSchool = findAge(years, input.schoolStartAge);
  if (firstSchool) {
    steps.push(
      `The first school year (${yearWhen(firstSchool.yearFromNow)}) therefore costs ${formatMoney(firstSchool.school)} for school and ${formatMoney(firstSchool.extra)} for extras, plus ${formatMoney(firstSchool.living)} of living -- ${formatMoney(firstSchool.totalCost)} in that year.`,
    );
  }

  steps.push(
    `The raising nest egg is the present value that, invested at ${formatPercent(input.returnRate)}, pays each of those years through age ${input.universityStartAge - 1}. Today that is ${formatMoney(readiness.presentValueThrough18)}: living ${formatMoney(readiness.livingPresentValue)} and school plus extras ${formatMoney(readiness.schoolPresentValue)}.`,
  );

  if (readiness.childAlreadyHere) {
    steps.push(
      `The child is already here (age ${input.childAge}), so "years until ready" does not apply. Use extra yearly saving on the raising pot to close the remaining gap.`,
    );
  } else if (readiness.yearsUntilReady === 0) {
    steps.push(
      `At this yearly saving and return, that present value is already funded. You are ready for a baby now in this model.`,
    );
  } else if (readiness.yearsUntilReady !== null) {
    steps.push(
      `If you keep adding ${formatMoney(input.raisingAnnualSave)} a year at ${formatPercent(input.returnRate)}, the raising pot reaches that present value in ${yearsWord(readiness.yearsUntilReady)}. You planned ${yearsWord(readiness.plannedYearsUntilBaby)} until the baby.`,
    );
  } else {
    steps.push(
      `At ${formatMoney(input.raisingAnnualSave)} a year and ${formatPercent(input.returnRate)}, the raising present value is not reached in 40 years.`,
    );
  }

  if (readiness.salaryDependentSchool) {
    const until = raising.depletedAtAge !== null ? ` The raising pot runs out at age ${raising.depletedAtAge} with what you have now.` : "";
    steps.push(
      `With ${formatMoney(input.raisingSavings)} already in the raising pot and ${formatMoney(input.raisingAnnualSave)} added each year, living may be possible but preschool and school would sit mainly on salary.${until} The year-by-year map shows when that pot crosses below zero.`,
    );
  } else if (raising.depletedAtAge !== null) {
    steps.push(
      `With what you have now, the raising pot runs out at age ${raising.depletedAtAge}. Living through school start is ${readiness.coversLivingToSchool ? "funded" : "not funded"} in this model.`,
    );
  } else if (raising.costYears > 0) {
    steps.push("With what you have now, the raising pot lasts through 18 in this model.");
  } else {
    steps.push("There are no remaining raising years on this run, so that nest egg is $0.");
  }

  const firstUni = findAge(years, input.universityStartAge);
  const uniStartNote = firstUni
    ? ` The first university year (${yearWhen(firstUni.yearFromNow)}) costs ${formatMoney(firstUni.university)}.`
    : "";
  steps.push(
    `University is a second nest egg. ${formatMoney(input.universityAnnualToday)} a year today for ${yearsWord(input.universityYears)} starting at age ${input.universityStartAge}, inflated at ${formatPercent(input.inflationRate)}. Needed today: ${formatMoney(university.nestEggNeededNow)}. You have ${formatMoney(input.universitySavings)}.${uniStartNote}`,
  );

  steps.push(
    `Together the two pots need ${formatMoney(result.combinedNeeded)} today. You have ${formatMoney(result.combinedHave)} already split between them. The tables below are the current plan -- what you have and what you add each year -- not the fully funded path. Use them as a year-by-year map.`,
  );

  return steps;
}

export type ChildMilestone = {
  id: string;
  label: string;
  yearFromNow: number;
  childAge: number | null;
  note: string;
};

/** Landmark years so the full table can be read as a plan. */
export function childMilestones(result: ChildEstimate): ChildMilestone[] {
  const { input, years } = result;
  const marks: ChildMilestone[] = [];
  if (years.length === 0) return marks;

  const first = years[0];
  marks.push({
    id: "now",
    label: "Now",
    yearFromNow: 0,
    childAge: first.childAge,
    note: first.phase === "before-baby" ? "Saving only. The baby has not arrived yet." : `Age ${first.childAge}. ${CHILD_PHASE_LABEL[first.phase]}.`,
  });

  const baby = years.find((row) => row.phase !== "before-baby");
  if (baby && baby.yearFromNow > 0) {
    marks.push({
      id: "baby",
      label: "Baby arrives",
      yearFromNow: baby.yearFromNow,
      childAge: baby.childAge,
      note: `Living costs begin. First-year living is ${formatMoney(baby.living)}.`,
    });
  }

  const school = findAge(years, input.schoolStartAge);
  if (school) {
    marks.push({
      id: "school",
      label: "School starts",
      yearFromNow: school.yearFromNow,
      childAge: school.childAge,
      note: `School ${formatMoney(school.school)} + extras ${formatMoney(school.extra)} + living ${formatMoney(school.living)}.`,
    });
  }

  const lastRaising = [...years].reverse().find((row) => row.phase === "school" || row.phase === "early-years");
  if (lastRaising && lastRaising.childAge !== input.schoolStartAge) {
    marks.push({
      id: "last-raising",
      label: "Last raising year",
      yearFromNow: lastRaising.yearFromNow,
      childAge: lastRaising.childAge,
      note: `Through 18 ends after this year. Total that year ${formatMoney(lastRaising.totalCost)}.`,
    });
  }

  const uni = findAge(years, input.universityStartAge);
  if (uni) {
    marks.push({
      id: "university",
      label: "University starts",
      yearFromNow: uni.yearFromNow,
      childAge: uni.childAge,
      note: `Raising costs stop. University that year ${formatMoney(uni.university)}.`,
    });
  }

  const last = years[years.length - 1];
  if (last.phase === "university" && last.childAge !== input.universityStartAge) {
    marks.push({
      id: "university-end",
      label: "Last university year",
      yearFromNow: last.yearFromNow,
      childAge: last.childAge,
      note: `University that year ${formatMoney(last.university)}.`,
    });
  }

  return marks;
}
