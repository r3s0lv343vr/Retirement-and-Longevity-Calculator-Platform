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
      raisingAnnualSave: 18_000,
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
});
