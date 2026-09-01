import { describe, expect, it } from "vitest";
import { CHILD_DEFAULT } from "./defaults";
import { estimateChild, mergeChildInput, validateChildInput } from "./estimateChild";

describe("CHILD_DEFAULT", () => {
  it("starts as a newborn with two empty pots", () => {
    expect(CHILD_DEFAULT.childAge).toBe(0);
    expect(CHILD_DEFAULT.schoolStartAge).toBe(5);
    expect(CHILD_DEFAULT.universityStartAge).toBe(18);
    expect(CHILD_DEFAULT.raisingSavings).toBe(0);
    expect(CHILD_DEFAULT.universitySavings).toBe(0);
  });
});

describe("estimateChild", () => {
  it("asks for two separate nest eggs on the default newborn plan", () => {
    const result = estimateChild(CHILD_DEFAULT);
    expect(result.raising.nestEggNeededNow).toBeGreaterThan(0);
    expect(result.university.nestEggNeededNow).toBeGreaterThan(0);
    expect(result.combinedNeeded).toBe(result.raising.nestEggNeededNow + result.university.nestEggNeededNow);
    expect(result.raising.costYears).toBe(13);
    expect(result.raising.firstCostAge).toBe(5);
    expect(result.raising.lastCostAge).toBe(17);
    expect(result.university.costYears).toBe(4);
    expect(result.university.firstCostAge).toBe(18);
    expect(result.university.lastCostAge).toBe(21);
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
    expect(result.university.depletedAtAge).toBeNull();
  });

  it("rejects an invalid school window", () => {
    const input = mergeChildInput({ schoolStartAge: 18, universityStartAge: 18 });
    expect(validateChildInput(input).some((e) => e.includes("School start"))).toBe(true);
  });
});
