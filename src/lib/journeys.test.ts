import { describe, expect, it } from "vitest";
import { JOURNEYS, navHrefForCurrent } from "./journeys";

describe("family-finance journeys", () => {
  it("assigns every existing calculator to one unique pillar for the catalog", () => {
    const assigned = JOURNEYS.flatMap((journey) => journey.calculators);
    expect(assigned.sort()).toEqual(
      ["/child", "/claim", "/goal", "/housing", "/longevity", "/mortgage", "/mortgage/payoff", "/need", "/when"].sort(),
    );
  });

  it("highlights the pillar, not the old calculator chips", () => {
    expect(navHrefForCurrent("/child")).toBe("/family");
    expect(navHrefForCurrent("/mortgage/payoff")).toBe("/home");
    expect(navHrefForCurrent("/goal")).toBe("/savings");
    expect(navHrefForCurrent("/longevity")).toBe("/retirement");
    expect(navHrefForCurrent("/housing")).toBe("/retirement");
    expect(navHrefForCurrent("/about")).toBe("/about");
    expect(navHrefForCurrent("/guides")).toBe("/guides");
    expect(navHrefForCurrent("/guides/family")).toBe("/guides");
    expect(navHrefForCurrent("/guides/family/can-i-afford-to-have-a-baby")).toBe("/guides");
    expect(navHrefForCurrent("/guides/family/how-much-should-you-save-before-having-a-baby")).toBe("/guides");
  });
});
