import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT, projectBase } from "@/lib/engine";
import { HOUSING_DEFAULT } from "./defaults";
import { estimateHousing, inputAtCcrc, inputAtNursing, inputAtStayHome } from "./estimateHousing";

describe("HOUSING_DEFAULT", () => {
  it("starts from the lean plan and sets the two facility rents for the compare", () => {
    expect(HOUSING_DEFAULT.currentAge).toBe(DEFAULT_INPUT.currentAge);
    expect(HOUSING_DEFAULT.lifestyleSpendToday).toBe(DEFAULT_INPUT.lifestyleSpendToday);
    expect(HOUSING_DEFAULT.seniorHomeRentAnnual).toBe(0);
    expect(HOUSING_DEFAULT.ccrcRentAnnual).toBe(48_000);
    expect(HOUSING_DEFAULT.nursingHomeRentAnnual).toBe(100_000);
    expect(HOUSING_DEFAULT.partTimeAnnualIncome).toBe(0);
    expect(HOUSING_DEFAULT.twoPerson).toBe(false);
  });
});

describe("estimateHousing", () => {
  it("runs stay home, CCRC, and nursing as exclusive paths", () => {
    const result = estimateHousing(HOUSING_DEFAULT);
    const homeYear = projectBase(result.home.input).years.find((y) => y.age === 88);
    const ccrcYear = projectBase(result.ccrc.input).years.find((y) => y.age === 88);
    const nursingYear = projectBase(result.nursing.input).years.find((y) => y.age === 88);
    expect(homeYear?.housingKind).toBeNull();
    expect(homeYear?.housingSpend).toBe(0);
    expect(ccrcYear?.housingKind).toBe("ccrc");
    expect(nursingYear?.housingKind).toBe("nursing");
    expect(result.ccrc.input.nursingHomeRentAnnual).toBe(0);
    expect(result.nursing.input.ccrcRentAnnual).toBe(0);
    expect(result.home.input.ccrcRentAnnual).toBe(0);
    expect(result.home.input.nursingHomeRentAnnual).toBe(0);
  });

  it("does not stack CCRC and nursing on the same path", () => {
    const ccrc = inputAtCcrc(HOUSING_DEFAULT);
    const nursing = inputAtNursing(HOUSING_DEFAULT);
    expect(ccrc.ccrcRentAnnual).toBe(HOUSING_DEFAULT.ccrcRentAnnual);
    expect(ccrc.nursingHomeRentAnnual).toBe(0);
    expect(nursing.nursingHomeRentAnnual).toBe(HOUSING_DEFAULT.nursingHomeRentAnnual);
    expect(nursing.ccrcRentAnnual).toBe(0);
  });

  it("keeps stay home at least as far as the facility paths on the default rents", () => {
    const result = estimateHousing(HOUSING_DEFAULT);
    expect(result.home.fundedThroughAge).toBeGreaterThanOrEqual(result.ccrc.fundedThroughAge);
    expect(result.home.fundedThroughAge).toBeGreaterThanOrEqual(result.nursing.fundedThroughAge);
    expect(result.home.totalHousingSpend).toBe(0);
    expect(result.ccrc.totalHousingSpend).toBeGreaterThan(0);
    expect(result.nursing.totalHousingSpend).toBeGreaterThan(0);
  });

  it("asks for more nest egg when nursing rent is on the path", () => {
    const result = estimateHousing({
      ...HOUSING_DEFAULT,
      currentSavings: 400000,
      annualContribution: 0,
    });
    expect(result.nursing.nestEggNeededNow).toBeGreaterThanOrEqual(result.home.nestEggNeededNow);
    expect(result.ccrc.nestEggNeededNow).toBeGreaterThanOrEqual(result.home.nestEggNeededNow);
  });

  it("warns when a facility rent is zero", () => {
    const result = estimateHousing({ ...HOUSING_DEFAULT, ccrcRentAnnual: 0, nursingHomeRentAnnual: 0 });
    expect(result.warnings.some((w) => w.includes("CCRC rent is $0"))).toBe(true);
    expect(result.warnings.some((w) => w.includes("Nursing rent is $0"))).toBe(true);
    expect(result.ccrc.fundedThroughAge).toBe(result.home.fundedThroughAge);
    expect(result.nursing.fundedThroughAge).toBe(result.home.fundedThroughAge);
    expect(result.longest).toBe("tie");
  });

  it("uses stay-home as the validation probe so both rents can sit on the form", () => {
    const home = inputAtStayHome(HOUSING_DEFAULT);
    expect(home.seniorHomeRentAnnual).toBe(0);
    expect(home.ccrcRentAnnual).toBe(0);
    expect(home.nursingHomeRentAnnual).toBe(0);
  });
});
