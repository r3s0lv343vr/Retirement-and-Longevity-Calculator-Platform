import { describe, expect, it } from "vitest";
import { CHILD_DEFAULT } from "./defaults";
import { birthDelay, estimateChild, mergeChildInput, validateChildInput } from "./estimateChild";

describe("CHILD_DEFAULT", () => {
  it("starts as a newborn with two empty pots and a monthly living cost", () => {
    expect(CHILD_DEFAULT.childAge).toBe(0);
    expect(CHILD_DEFAULT.yearsUntilBaby).toBe(0);
    expect(CHILD_DEFAULT.monthlyChildCostToday).toBe(1_200);
    expect(CHILD_DEFAULT.schoolStartAge).toBe(5);
    expect(CHILD_DEFAULT.universityStartAge).toBe(18);
    expect(CHILD_DEFAULT.raisingSavings).toBe(0);
    expect(CHILD_DEFAULT.educationInflationRate).toBe(0.05);
  });
});

describe("estimateChild", () => {
  it("asks for two separate nest eggs and a present value through 18", () => {
    const result = estimateChild(CHILD_DEFAULT);
    expect(result.raising.nestEggNeededNow).toBeGreaterThan(0);
    expect(result.university.nestEggNeededNow).toBeGreaterThan(0);
    expect(result.readiness.presentValueThrough18).toBe(result.raising.nestEggNeededNow);
    expect(result.readiness.livingPresentValue).toBeGreaterThan(0);
    expect(result.readiness.schoolPresentValue).toBeGreaterThan(0);
    expect(result.raising.firstCostAge).toBe(0);
    expect(result.raising.lastCostAge).toBe(17);
    expect(result.university.costYears).toBe(4);
  });

  it("raises the through-18 nest egg when school or extras rise, not the university pot", () => {
    const base = estimateChild(CHILD_DEFAULT);
    const school = estimateChild({ ...CHILD_DEFAULT, schoolAnnualToday: 24_000 });
    const extras = estimateChild({ ...CHILD_DEFAULT, extraAnnualToday: 8_000 });
    expect(school.raising.nestEggNeededNow).toBeGreaterThan(base.raising.nestEggNeededNow);
    expect(extras.raising.nestEggNeededNow).toBeGreaterThan(base.raising.nestEggNeededNow);
    expect(school.university.nestEggNeededNow).toBe(base.university.nestEggNeededNow);
    expect(extras.university.nestEggNeededNow).toBe(base.university.nestEggNeededNow);
  });

  it("raises living present value when monthly cost or age-demand rises", () => {
    const base = estimateChild(CHILD_DEFAULT);
    const monthly = estimateChild({ ...CHILD_DEFAULT, monthlyChildCostToday: 2_400 });
    const demand = estimateChild({ ...CHILD_DEFAULT, ageDemandRate: 0.05 });
    expect(monthly.readiness.livingPresentValue).toBeGreaterThan(base.readiness.livingPresentValue);
    expect(demand.readiness.livingPresentValue).toBeGreaterThan(base.readiness.livingPresentValue);
    expect(monthly.university.nestEggNeededNow).toBe(base.university.nestEggNeededNow);
  });

  it("solves years until the raising pot is ready at a given saving rate", () => {
    const result = estimateChild({
      ...CHILD_DEFAULT,
      yearsUntilBaby: 0,
      raisingSavings: 0,
      raisingAnnualSave: 25_000,
    });
    expect(result.readiness.yearsUntilReady).not.toBeNull();
    expect(result.readiness.yearsUntilReady).toBeGreaterThan(0);
    expect(result.readiness.yearsUntilReady).toBeLessThanOrEqual(40);
    const slower = estimateChild({
      ...CHILD_DEFAULT,
      raisingSavings: 0,
      raisingAnnualSave: 22_000,
    });
    expect(slower.readiness.yearsUntilReady).not.toBeNull();
    expect(slower.readiness.yearsUntilReady as number).toBeGreaterThan(result.readiness.yearsUntilReady ?? 0);
  });

  it("flags when the baby is possible but school would sit on salary", () => {
    const result = estimateChild({
      ...CHILD_DEFAULT,
      raisingSavings: 8_000,
      raisingAnnualSave: 0,
      monthlyChildCostToday: 1_200,
      schoolAnnualToday: 12_000,
    });
    expect(result.readiness.salaryDependentSchool).toBe(true);
    expect(result.warnings.some((w) => w.includes("depend mainly on salary"))).toBe(true);
  });

  it("does not wait to have a baby when the child is already here", () => {
    expect(birthDelay({ ...CHILD_DEFAULT, childAge: 4, yearsUntilBaby: 6 })).toBe(0);
    const result = estimateChild({ ...CHILD_DEFAULT, childAge: 4, yearsUntilBaby: 6 });
    expect(result.readiness.childAlreadyHere).toBe(true);
    expect(result.readiness.yearsUntilReady).toBeNull();
  });

  it("raises only the university nest egg when university cost rises", () => {
    const base = estimateChild(CHILD_DEFAULT);
    const costly = estimateChild({ ...CHILD_DEFAULT, universityAnnualToday: 50_000 });
    expect(costly.university.nestEggNeededNow).toBeGreaterThan(base.university.nestEggNeededNow);
    expect(costly.raising.nestEggNeededNow).toBe(base.raising.nestEggNeededNow);
  });

  it("drops the raising nest egg once the child is already at university age", () => {
    const result = estimateChild({ ...CHILD_DEFAULT, childAge: 18 });
    expect(result.raising.nestEggNeededNow).toBe(0);
    expect(result.raising.costYears).toBe(0);
    expect(result.university.costYears).toBe(4);
    expect(result.university.nestEggNeededNow).toBeGreaterThan(0);
    expect(result.warnings.some((w) => w.includes("already at university age"))).toBe(true);
  });

  it("cuts nest egg needed today when yearly saving is already on the form", () => {
    const none = estimateChild({ ...CHILD_DEFAULT, raisingAnnualSave: 0, universityAnnualSave: 0 });
    const saving = estimateChild({ ...CHILD_DEFAULT, raisingAnnualSave: 8_000, universityAnnualSave: 6_000 });
    expect(saving.raising.nestEggNeededNow).toBeLessThan(none.raising.nestEggNeededNow);
    expect(saving.university.nestEggNeededNow).toBeLessThan(none.university.nestEggNeededNow);
  });

  it("marks a pot already enough when current savings cover it", () => {
    const result = estimateChild({
      ...CHILD_DEFAULT,
      raisingSavings: 5_000_000,
      universitySavings: 5_000_000,
    });
    expect(result.raising.alreadyEnough).toBe(true);
    expect(result.university.alreadyEnough).toBe(true);
    expect(result.raising.additionalNestEgg).toBe(0);
    expect(result.raising.depletedAtAge).toBeNull();
    expect(result.readiness.salaryDependentSchool).toBe(false);
    expect(result.readiness.yearsUntilReady).toBe(0);
  });

  it("rejects an invalid school window", () => {
    const input = mergeChildInput({ schoolStartAge: 18, universityStartAge: 18 });
    expect(validateChildInput(input).some((e) => e.includes("School start"))).toBe(true);
  });

  it("exports a year-by-year map with living at age 0, school from 5, university from 18", () => {
    const result = estimateChild(CHILD_DEFAULT);
    const age0 = result.years.find((row) => row.childAge === 0);
    const age4 = result.years.find((row) => row.childAge === 4);
    const age5 = result.years.find((row) => row.childAge === 5);
    const age17 = result.years.find((row) => row.childAge === 17);
    const age18 = result.years.find((row) => row.childAge === 18);
    expect(age0?.living).toBe(14_400);
    expect(age0?.school).toBe(0);
    expect(age0?.extra).toBe(0);
    expect(age0?.phase).toBe("early-years");
    expect(age4?.school).toBe(0);
    expect(age5?.school).toBeGreaterThan(0);
    expect(age5?.extra).toBeGreaterThan(0);
    expect(age5?.phase).toBe("school");
    expect(age17?.university).toBe(0);
    expect(age17?.living).toBeGreaterThan(0);
    expect(age18?.living).toBe(0);
    expect(age18?.school).toBe(0);
    expect(age18?.university).toBeGreaterThan(0);
    expect(age18?.phase).toBe("university");
    expect(result.years[result.years.length - 1]?.childAge).toBe(21);
    expect(result.raising.depletedAtAge).toBe(0);
    expect(result.years[0]?.raisingEnd).toBeLessThan(0);
    const lastRaising = result.years.find((row) => row.childAge === 17);
    expect(lastRaising?.raisingEnd).toBeCloseTo(result.raising.endingWithWhatYouHave, 5);
    const firstUni = result.years.find((row) => row.childAge === 18);
    expect(firstUni?.raisingEnd).toBeCloseTo(lastRaising?.raisingEnd ?? 0, 5);
  });

  it("keeps delay years before birth on the map", () => {
    const result = estimateChild({ ...CHILD_DEFAULT, yearsUntilBaby: 3 });
    expect(result.years[0]?.phase).toBe("before-baby");
    expect(result.years[0]?.childAge).toBeNull();
    expect(result.years[0]?.living).toBe(0);
    expect(result.years[3]?.childAge).toBe(0);
    expect(result.years[3]?.living).toBeGreaterThan(14_400);
  });

  it("raises school and university when education inflation rises, not living", () => {
    const base = estimateChild(CHILD_DEFAULT);
    const hotter = estimateChild({ ...CHILD_DEFAULT, educationInflationRate: 0.08 });
    expect(hotter.readiness.schoolPresentValue).toBeGreaterThan(base.readiness.schoolPresentValue);
    expect(hotter.university.nestEggNeededNow).toBeGreaterThan(base.university.nestEggNeededNow);
    expect(hotter.readiness.livingPresentValue).toBe(base.readiness.livingPresentValue);
    expect(hotter.years.find((row) => row.childAge === 0)?.living).toBe(14_400);
  });

  it("matches the old school path when education inflation equals ordinary inflation", () => {
    const split = estimateChild({ ...CHILD_DEFAULT, inflationRate: 0.04, educationInflationRate: 0.04 });
    const age5 = split.years.find((row) => row.childAge === 5);
    expect(age5?.school).toBeCloseTo(12_000 * 1.04 ** 5, 5);
    expect(age5?.extra).toBeCloseTo(3_600 * 1.04 ** 5, 5);
  });

  it("solves the yearly add until university so the raising pot stays off salary", () => {
    const solved = estimateChild(CHILD_DEFAULT);
    expect(solved.raisingSave.byBaby.years).toBe(0);
    expect(solved.raisingSave.byBaby.annualSave).toBeNull();
    expect(solved.raisingSave.bySchool.years).toBe(5);
    expect(solved.raisingSave.byUniversity.years).toBe(18);
    const bySchool = solved.raisingSave.bySchool.annualSave;
    const byUni = solved.raisingSave.byUniversity.annualSave;
    expect(bySchool).not.toBeNull();
    expect(byUni).not.toBeNull();
    expect(bySchool as number).toBeGreaterThan(byUni as number);

    const funded = estimateChild({
      ...CHILD_DEFAULT,
      raisingAnnualSave: byUni as number,
    });
    expect(funded.raising.depletedAtAge).toBeNull();
    expect(funded.readiness.coversSchool).toBe(true);
    expect(funded.readiness.yearsUntilReady).toBe(0);
    expect(funded.raisingSave.byUniversity.extraAnnualSave).toBe(0);
  });

  it("needs a larger yearly add if you only save until the baby arrives", () => {
    const planned = estimateChild({ ...CHILD_DEFAULT, yearsUntilBaby: 8, raisingAnnualSave: 0 });
    const byBaby = planned.raisingSave.byBaby.annualSave;
    const byUni = planned.raisingSave.byUniversity.annualSave;
    expect(planned.raisingSave.byBaby.years).toBe(8);
    expect(byBaby).not.toBeNull();
    expect(byUni).not.toBeNull();
    expect(byBaby as number).toBeGreaterThan(byUni as number);

    const funded = estimateChild({
      ...CHILD_DEFAULT,
      yearsUntilBaby: 8,
      raisingAnnualSave: byBaby as number,
    });
    expect(funded.readiness.yearsUntilReady).not.toBeNull();
    expect(funded.readiness.yearsUntilReady as number).toBeLessThanOrEqual(8);
  });
});
