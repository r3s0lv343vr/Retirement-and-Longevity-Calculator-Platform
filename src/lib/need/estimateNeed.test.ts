import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT } from "@/lib/engine";
import { NEED_DEFAULT } from "./defaults";
import { estimateNeed } from "./estimateNeed";

describe("NEED_DEFAULT", () => {
  it("starts from the longevity defaults but leaves extras at zero", () => {
    expect(NEED_DEFAULT.currentAge).toBe(DEFAULT_INPUT.currentAge);
    expect(NEED_DEFAULT.lifestyleSpendToday).toBe(DEFAULT_INPUT.lifestyleSpendToday);
    expect(NEED_DEFAULT.partTimeAnnualIncome).toBe(0);
    expect(NEED_DEFAULT.longTermCareAnnual).toBe(0);
    expect(NEED_DEFAULT.nursingHomeRentAnnual).toBe(0);
    expect(NEED_DEFAULT.twoPerson).toBe(false);
  });
});

describe("estimateNeed", () => {
  it("asks for more nest egg on a thin plan than on a large one", () => {
    const thin = estimateNeed({ ...NEED_DEFAULT, currentSavings: 150000, annualContribution: 0 });
    const large = estimateNeed({ ...NEED_DEFAULT, currentSavings: 4_000_000 });
    expect(thin.additionalNestEgg).toBeGreaterThan(large.additionalNestEgg);
    expect(large.alreadyEnough).toBe(true);
    expect(large.additionalNestEgg).toBe(0);
    expect(thin.alreadyEnough).toBe(false);
  });

  it("uses the entered lifestyle, not the comfortable-living floor", () => {
    const entered = estimateNeed({
      ...NEED_DEFAULT,
      currentSavings: 200000,
      annualContribution: 0,
      lifestyleSpendToday: 40000,
    });
    const higherSpend = estimateNeed({
      ...NEED_DEFAULT,
      currentSavings: 200000,
      annualContribution: 0,
      lifestyleSpendToday: 80000,
    });
    expect(higherSpend.nestEggNeededNow).toBeGreaterThan(entered.nestEggNeededNow);
    expect(entered.input.lifestyleSpendToday).toBe(40000);
  });

  it("funds through the plan-through age when the needed nest egg is used", () => {
    const result = estimateNeed({ ...NEED_DEFAULT, currentSavings: 100000 });
    expect(result.fundedThroughIfFunded).toBe(NEED_DEFAULT.planToAge);
  });
});
