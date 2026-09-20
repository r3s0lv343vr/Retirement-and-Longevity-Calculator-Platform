import { describe, expect, it } from "vitest";
import { MORTGAGE_DEFAULT } from "./defaults";
import { estimateMortgage, monthlyPrincipalAndInterest } from "./estimateMortgage";
import { TRUE_COST_GUIDE_FIGURES as F } from "./trueCostGuideFigures";

describe("true-cost guide figures", () => {
  it("uses the Can I Get a Mortgage default first-home path", () => {
    expect(F.homePrice).toBe(425_000);
    expect(F.downPayment).toBe(85_000);
    expect(F.annualRate).toBe(0.065);
    expect(F.termYears).toBe(30);
    expect(F.loanAmount).toBe(340_000);
  });

  it("matches the calculator payment, housing cost, and cash to buy", () => {
    const live = estimateMortgage(MORTGAGE_DEFAULT);
    expect(F.monthlyPI).toBe(monthlyPrincipalAndInterest(340_000, 0.065, 30));
    expect(F.monthlyPI).toBe(live.primary.monthlyPI);
    expect(Math.round(F.monthlyPI)).toBe(2149);
    expect(Math.round(F.firstHousingMonthly)).toBe(3184);
    expect(F.cashToBuy).toBe(98_500);
    expect(F.breakdown.pmi).toBe(0);
    expect(F.breakdown.hoa).toBe(0);
  });

  it("applies extra-to-principal rules on the 10% down PMI path", () => {
    expect(F.tenLoan).toBe(382_500);
    expect(Math.round(F.tenMonthlyPI)).toBe(2418);
    expect(F.tenPmiDropYear).toBe(8);
    expect(F.tenCashToBuy).toBe(56_000);
  });
});
