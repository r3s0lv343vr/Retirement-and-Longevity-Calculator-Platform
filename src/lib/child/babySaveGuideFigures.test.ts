import { describe, expect, it } from "vitest";
import {
  BABY_SAVE_CARE_IN_MONTHLY_INPUT,
  BABY_SAVE_CONTRIBUTION_INPUT,
  BABY_SAVE_FIGURES as F,
  BABY_SAVE_LIVING_INPUT,
  BABY_SAVE_UNIVERSITY_INPUT,
} from "./babySaveGuideFigures";
import { estimateChild } from "./estimateChild";

function livingAt(yearsFromNow: number, age: number) {
  const base = F.monthly * 12;
  return base * (1 + F.inflationRate) ** yearsFromNow * (1 + F.ageDemandRate) ** age;
}

describe("baby-savings guide figures match Nest Eggs for a Child", () => {
  it("uses the calculator living formula, not one combined growth rate", () => {
    expect(F.c1).toBe(F.monthly * 12);
    expect(Math.round(livingAt(0, 0))).toBe(F.livingY0);
    expect(Math.round(livingAt(5, 5))).toBe(F.livingY5);
    expect(Math.round(livingAt(10, 10))).toBe(F.livingY10);
    expect(Math.round(livingAt(17, 17))).toBe(F.livingY17);
    const rows = estimateChild(BABY_SAVE_LIVING_INPUT).years;
    expect(Math.round(rows.find((row) => row.childAge === 0)?.living ?? 0)).toBe(F.livingY0);
    expect(Math.round(rows.find((row) => row.childAge === 5)?.living ?? 0)).toBe(F.livingY5);
    expect(Math.round(rows.find((row) => row.childAge === 10)?.living ?? 0)).toBe(F.livingY10);
    expect(Math.round(rows.find((row) => row.childAge === 17)?.living ?? 0)).toBe(F.livingY17);
  });

  it("uses the calculator raising nest egg, including yearly adds", () => {
    const none = estimateChild(BABY_SAVE_LIVING_INPUT);
    const noAge = estimateChild({ ...BABY_SAVE_LIVING_INPUT, ageDemandRate: 0 });
    const saving = estimateChild(BABY_SAVE_CONTRIBUTION_INPUT);
    expect(none.raising.nestEggNeededNow).toBe(F.raisingEggLivingOnly);
    expect(noAge.raising.nestEggNeededNow).toBe(F.raisingEggNoAgeDemand);
    expect(saving.raising.nestEggNeededNow).toBe(F.raisingEggWithSave);
    expect(saving.raising.additionalNestEgg).toBe(F.additionalEggWithSave);
    expect(saving.raising.additionalAnnualSavings).toBe(F.extraAnnualWithSave);
    expect(saving.readiness.yearsUntilReady).toBe(F.yearsUntilReady);
    expect(saving.readiness.readyByPlannedBaby).toBe(false);
  });

  it("treats university as four inflated years, not one lump at 18", () => {
    const uni = estimateChild(BABY_SAVE_UNIVERSITY_INPUT);
    expect(uni.university.costYears).toBe(F.universityYears);
    expect(Math.round(uni.years.find((row) => row.childAge === 18)?.university ?? 0)).toBe(F.uniFirstYear);
    expect(Math.round(uni.years.find((row) => row.childAge === 21)?.university ?? 0)).toBe(F.uniLastYear);
    expect(uni.university.nestEggNeededNow).toBe(F.uniEgg);
    expect(F.uniEgg).not.toBe(F.universityAnnualToday);
  });

  it("puts extra paid care in monthly living through 18, not a four-year block", () => {
    const care = estimateChild(BABY_SAVE_CARE_IN_MONTHLY_INPUT);
    expect(care.years.filter((row) => row.living > 0)).toHaveLength(18);
    expect(care.raising.nestEggNeededNow).toBe(F.care2400Egg);
  });
});
