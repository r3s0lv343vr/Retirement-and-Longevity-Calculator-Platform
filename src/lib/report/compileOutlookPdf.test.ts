import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT, project } from "@/lib/engine";
import { formatMoney } from "@/lib/format";
import { compileOutlookPdf, outlookPdfFilename } from "./compileOutlookPdf";

function pdfLatin1(bytes: ArrayBuffer): string {
  return Buffer.from(bytes).toString("latin1");
}

describe("outlookPdfFilename", () => {
  it("uses the plan ages", () => {
    expect(outlookPdfFilename({ currentAge: 58, planToAge: 95 })).toBe("longevity-outlook-age-58-to-95.pdf");
  });
});

describe("compileOutlookPdf", () => {
  it("builds a PDF for a completed default outlook without storing anything", () => {
    const result = project(DEFAULT_INPUT);
    const bytes = compileOutlookPdf(result, new Date("2026-08-30T12:00:00Z"));
    const text = pdfLatin1(bytes);

    const head = new Uint8Array(bytes, 0, 5);
    expect(bytes.byteLength).toBeGreaterThan(2000);
    expect(String.fromCharCode(head[0], head[1], head[2], head[3], head[4])).toBe("%PDF-");
    expect(text).toContain("Retirement Longevity Outlook");
    expect(text).toContain("Months of capital required");
    expect(text).toContain(`${result.outlook.requiredMonths} months`);
    expect(text).toContain(`${result.outlook.coveredMonths} months`);
    expect(text).toContain("Nest egg + later income");
    expect(text).toContain("Comfortable living");
    expect(text).toContain("Year-by-year snapshot");
    expect(text).toContain("Current retirement savings");
    expect(text).toContain("Not stored on a server");
    expect(text).toContain(String(result.outlook.fundedThroughAge));
  });

  it("includes surplus wording when leftover savings last past the plan", () => {
    const result = project({
      ...DEFAULT_INPUT,
      currentSavings: 5_000_000,
      lifestyleSpendToday: 40000,
      healthcareSpendToday: 5000,
      longTermCareAnnual: 0,
    });
    const text = pdfLatin1(compileOutlookPdf(result));
    expect(result.outlook.surpassesRequiredMonths).toBe(true);
    expect(text).toContain("This surpasses the required");
    expect(text).toContain(formatMoney(result.outlook.remainingSavings));
  });

  it("includes remaining-expense wording when capital runs out", () => {
    const result = project(DEFAULT_INPUT);
    const text = pdfLatin1(compileOutlookPdf(result));
    expect(result.outlook.depleted).toBe(true);
    expect(text).toContain("Savings still required for remaining expenses");
    expect(text).toContain(formatMoney(result.outlook.remainingExpenseNeed));
  });
});
