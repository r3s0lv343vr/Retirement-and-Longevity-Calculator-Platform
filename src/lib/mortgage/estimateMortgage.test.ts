import { describe, expect, it } from "vitest";
import { MORTGAGE_DEFAULT } from "./defaults";
import {
  compareIsActive,
  downPaymentPercent,
  estimateMortgage,
  loanAmountFor,
  mergeMortgageInput,
  monthlyPrincipalAndInterest,
  validateMortgageInput,
} from "./estimateMortgage";

describe("mortgage math", () => {
  it("sizes the loan from price minus down payment", () => {
    expect(loanAmountFor(425_000, 85_000)).toBe(340_000);
    expect(downPaymentPercent(425_000, 85_000)).toBeCloseTo(0.2);
  });

  it("matches a known 30-year payment", () => {
    const payment = monthlyPrincipalAndInterest(400_000, 0.06, 30);
    expect(payment).toBeCloseTo(2398.2, 1);
  });

  it("rejects a down payment larger than the price", () => {
    const errors = validateMortgageInput(mergeMortgageInput({ downPayment: 500_000, homePrice: 400_000 }));
    expect(errors.some((row) => row.includes("Down payment"))).toBe(true);
  });

  it("says the default 30-year path is tight or comfortable, not depleted", () => {
    const result = estimateMortgage(MORTGAGE_DEFAULT);
    expect(["comfortable", "tight", "buffered", "short"]).toContain(result.status);
    expect(result.primary.loanAmount).toBe(340_000);
    expect(result.primary.monthlyPI).toBeGreaterThan(2000);
    expect(result.primary.years.length).toBe(30);
    expect(result.primary.snapshots.some((row) => row.year === 1)).toBe(true);
    expect(result.primary.snapshots.some((row) => row.year === 10)).toBe(true);
    expect(result.compare).not.toBeNull();
    expect(result.compare?.years.length).toBe(15);
  });

  it("inflates insurance so year 10 costs more than year 1", () => {
    const result = estimateMortgage(MORTGAGE_DEFAULT);
    const y1 = result.primary.years[0];
    const y10 = result.primary.years[9];
    expect(y10.insurance).toBeGreaterThan(y1.insurance);
    expect(y10.tax).toBeGreaterThan(y1.tax);
  });

  it("drops PMI after loan-to-value crosses 80%", () => {
    const input = mergeMortgageInput({
      homePrice: 400_000,
      downPayment: 40_000,
      pmiMonthly: 180,
      extraMonthly: 0,
    });
    const result = estimateMortgage(input);
    expect(result.primary.years[0].pmi).toBeGreaterThan(0);
    expect(result.warnings.some((row) => row.includes("PMI"))).toBe(false);
    const lastWithPmi = [...result.primary.years].reverse().find((row) => row.pmi > 0);
    expect(lastWithPmi).toBeTruthy();
    expect(result.primary.pmiDropYear).not.toBeNull();
  });

  it("draws the investment pile when the year is short", () => {
    const input = mergeMortgageInput({
      annualIncome: 48_000,
      investmentPile: 40_000,
      foodMonthly: 1_200,
    });
    const result = estimateMortgage(input);
    expect(result.primary.firstDrawYear).not.toBeNull();
    expect(["buffered", "depleted", "short", "tight"]).toContain(result.status);
  });

  it("turns compare off when the second loan matches the first", () => {
    const input = mergeMortgageInput({
      compareHomePrice: MORTGAGE_DEFAULT.homePrice,
      compareDownPayment: MORTGAGE_DEFAULT.downPayment,
      compareAnnualRate: MORTGAGE_DEFAULT.annualRate,
      compareTermYears: MORTGAGE_DEFAULT.termYears,
    });
    expect(compareIsActive(input)).toBe(false);
    expect(estimateMortgage(input).compare).toBeNull();
  });
});
