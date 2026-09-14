import { describe, expect, it } from "vitest";
import { PAYOFF_DEFAULT, defaultStrategies, mergePayoffInput, runPayoffStudio } from "@/lib/mortgage/payoff";
import { compilePayoffPdf, payoffPdfFilename } from "./compilePayoffPdf";

describe("payoff PDF", () => {
  it("builds a non-empty report from the default studio", () => {
    const input = mergePayoffInput({ ...PAYOFF_DEFAULT, extraMonthly: 250 });
    const studio = runPayoffStudio(input, defaultStrategies(), "quick");
    const bytes = compilePayoffPdf(studio, new Date("2026-09-14T00:00:00.000Z"));
    expect(bytes.byteLength).toBeGreaterThan(1000);
    expect(payoffPdfFilename(input)).toContain("mortgage-payoff");
  });
});
