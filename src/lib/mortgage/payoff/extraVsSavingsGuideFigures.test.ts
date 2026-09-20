import { describe, expect, it } from "vitest";
import { EXTRA_VS_SAVINGS_FIGURES as F, EXTRA_VS_SAVINGS_INPUT } from "./extraVsSavingsGuideFigures";
import { paymentFromBalanceRateTerm, monthlyRate } from "./formulas";
import { money } from "./money";

describe("extra vs savings guide figures", () => {
  it("uses the guide's remaining-balance example", () => {
    expect(EXTRA_VS_SAVINGS_INPUT.balance).toBe(300_000);
    expect(EXTRA_VS_SAVINGS_INPUT.annualRate).toBe(0.065);
    expect(EXTRA_VS_SAVINGS_INPUT.remainingYears).toBe(25);
    expect(EXTRA_VS_SAVINGS_INPUT.extraMonthly).toBe(250);
  });

  it("matches the payoff payment formula and rounds to the article's $2,026", () => {
    const raw = paymentFromBalanceRateTerm(300_000, monthlyRate(0.065), 25 * 12);
    expect(F.scheduledPayment).toBe(money(raw));
    expect(Math.round(F.scheduledPayment)).toBe(2026);
  });

  it("applies the extra to principal without recasting the scheduled payment", () => {
    expect(F.firstExtra).toBe(250);
    expect(F.firstScheduledPrincipal).toBe(money(F.scheduledPayment - F.firstInterest));
    expect(F.extraPeriods).toBeLessThan(F.baselinePeriods);
    expect(F.interestAvoided).toBeGreaterThan(0);
    expect(F.periodsSaved).toBe(F.baselinePeriods - F.extraPeriods);
  });

  it("matches the publication table: 25 years vs 19 years 4 months and about $80,245 less interest", () => {
    expect(F.baselinePeriods).toBe(300);
    expect(F.extraPeriods).toBe(232);
    expect(F.periodsSaved).toBe(68);
    expect(Math.round(F.extraInterest)).toBe(227_442);
    expect(Math.round(F.interestAvoided)).toBe(80_245);
    expect(Math.round(F.baselineInterest)).toBe(307_687);
  });
});
