import { describe, expect, it } from "vitest";
import { CHILD_DEFAULT } from "@/lib/child/defaults";
import { estimateChild } from "@/lib/child/estimateChild";
import { buildChildNarrative, childMilestones } from "@/lib/child/narrative";
import { formatMoney } from "@/lib/format";
import { childPdfFilename, compileChildPdf } from "./compileChildPdf";

function pdfLatin1(bytes: ArrayBuffer): string {
  return Buffer.from(bytes).toString("latin1");
}

describe("childPdfFilename", () => {
  it("uses child age when the child is already here", () => {
    expect(childPdfFilename({ childAge: 4, yearsUntilBaby: 0 })).toBe("child-nest-eggs-age-4.pdf");
  });

  it("uses years until the baby when the child is not here yet", () => {
    expect(childPdfFilename({ childAge: 0, yearsUntilBaby: 5 })).toBe("child-nest-eggs-baby-in-5-years.pdf");
  });

  it("uses a short name for a newborn now", () => {
    expect(childPdfFilename({ childAge: 0, yearsUntilBaby: 0 })).toBe("child-nest-eggs.pdf");
  });
});

describe("compileChildPdf", () => {
  it("builds a PDF for the default child run without storing anything", () => {
    const result = estimateChild(CHILD_DEFAULT);
    const bytes = compileChildPdf(result, new Date("2026-09-01T12:00:00Z"));
    const text = pdfLatin1(bytes);
    const steps = buildChildNarrative(result);
    const marks = childMilestones(result);

    const head = new Uint8Array(bytes, 0, 5);
    expect(bytes.byteLength).toBeGreaterThan(2000);
    expect(String.fromCharCode(head[0], head[1], head[2], head[3], head[4])).toBe("%PDF-");
    expect(text).toContain("Child Nest-Egg Outlook");
    expect(text).toContain("How we got here");
    expect(text).toContain("TRAIN OF THOUGHT");
    expect(text).toContain("Costs through the years");
    expect(text).toContain("The two pots through the years");
    expect(text).toContain("Not stored on a server");
    expect(text).toContain("school years would depend mainly on salary");
    expect(text).toContain(formatMoney(result.readiness.presentValueThrough18));
    expect(text).toContain(formatMoney(14_400));
    expect(text).toContain("School starts at age");
    expect(text).toContain("Child cost / month");
    expect(steps[0]).toContain("14,400");
    expect(marks.some((mark) => mark.id === "school")).toBe(true);
    expect(text).toContain("Landmarks on the map");
    expect(text).toContain("Yearly add to stay off salary");
    expect(text).toContain("Education inflation");
    expect(text).toContain("By university start");
  });
});
