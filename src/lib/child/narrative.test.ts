import { describe, expect, it } from "vitest";
import { CHILD_DEFAULT } from "./defaults";
import { estimateChild } from "./estimateChild";
import { buildChildNarrative, childMilestones } from "./narrative";

describe("buildChildNarrative", () => {
  it("walks the default run from monthly living to the two pots", () => {
    const result = estimateChild(CHILD_DEFAULT);
    const steps = buildChildNarrative(result);
    expect(steps.length).toBeGreaterThanOrEqual(8);
    expect(steps[0]).toContain("$1,200");
    expect(steps[0]).toContain("$14,400");
    expect(steps.join(" ")).toContain("present value");
    expect(steps.join(" ")).toContain("University is a second nest egg");
    expect(steps.join(" ")).toContain("year-by-year map");
    expect(steps.join(" ")).toContain("education inflation");
    expect(steps.join(" ")).toContain("yearly add");
  });
});

describe("childMilestones", () => {
  it("marks school start and university on the default map", () => {
    const marks = childMilestones(estimateChild(CHILD_DEFAULT));
    expect(marks.some((mark) => mark.id === "school" && mark.childAge === 5)).toBe(true);
    expect(marks.some((mark) => mark.id === "university" && mark.childAge === 18)).toBe(true);
    expect(marks.some((mark) => mark.id === "university-end" && mark.childAge === 21)).toBe(true);
  });
});
