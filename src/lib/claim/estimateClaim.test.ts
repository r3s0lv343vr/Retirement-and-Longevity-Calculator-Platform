import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT, projectBase, socialSecurityAnnualAtClaimAge } from "@/lib/engine";
import { CLAIM_DEFAULT } from "./defaults";
import { estimateClaim } from "./estimateClaim";

describe("CLAIM_DEFAULT", () => {
  it("starts from the longevity defaults but leaves extras at zero", () => {
    expect(CLAIM_DEFAULT.currentAge).toBe(DEFAULT_INPUT.currentAge);
    expect(CLAIM_DEFAULT.socialSecurityAnnual).toBe(DEFAULT_INPUT.socialSecurityAnnual);
    expect(CLAIM_DEFAULT.socialSecurityStartAge).toBe(67);
    expect(CLAIM_DEFAULT.partTimeAnnualIncome).toBe(0);
    expect(CLAIM_DEFAULT.longTermCareAnnual).toBe(0);
    expect(CLAIM_DEFAULT.twoPerson).toBe(false);
  });
});

describe("estimateClaim", () => {
  it("matches the How long compare card numbers", () => {
    const claim = estimateClaim(CLAIM_DEFAULT);
    const outlook = projectBase(CLAIM_DEFAULT).outlook;
    expect(claim.claiming67Annual).toBe(outlook.claiming67Annual);
    expect(claim.claiming70Annual).toBe(outlook.claiming70Annual);
    expect(claim.claiming67FundedThroughAge).toBe(outlook.claiming67FundedThroughAge);
    expect(claim.claiming70FundedThroughAge).toBe(outlook.claiming70FundedThroughAge);
  });

  it("scales a 67 check to 24% more at 70", () => {
    const claim = estimateClaim({
      ...CLAIM_DEFAULT,
      socialSecurityAnnual: 28800,
      socialSecurityStartAge: 67,
    });
    expect(claim.claiming67Annual).toBeCloseTo(28800);
    expect(claim.claiming70Annual).toBeCloseTo(28800 * 1.24);
    expect(claim.enteredAnnual).toBe(28800);
    expect(claim.enteredStartAge).toBe(67);
  });

  it("scales a 70 check back down to 67", () => {
    const at70 = 28800 * 1.24;
    const claim = estimateClaim({
      ...CLAIM_DEFAULT,
      socialSecurityAnnual: at70,
      socialSecurityStartAge: 70,
    });
    expect(claim.claiming70Annual).toBeCloseTo(at70);
    expect(claim.claiming67Annual).toBeCloseTo(
      socialSecurityAnnualAtClaimAge(at70, 70, 67),
    );
    expect(claim.claiming67Annual).toBeLessThan(claim.claiming70Annual);
  });

  it("does not change the nest egg — only the claim age", () => {
    const claim = estimateClaim(CLAIM_DEFAULT);
    expect(claim.input.currentSavings).toBe(CLAIM_DEFAULT.currentSavings);
    expect(claim.input.socialSecurityStartAge).toBe(CLAIM_DEFAULT.socialSecurityStartAge);
  });

  it("warns when Social Security is zero", () => {
    const claim = estimateClaim({ ...CLAIM_DEFAULT, socialSecurityAnnual: 0 });
    expect(claim.claiming67Annual).toBe(0);
    expect(claim.claiming70Annual).toBe(0);
    expect(claim.longerClaim).toBe("same");
    expect(claim.warnings.some((w) => w.includes("$0"))).toBe(true);
  });
});
