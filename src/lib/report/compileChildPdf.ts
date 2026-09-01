import { jsPDF } from "jspdf";
import { formatMoney, formatPercent } from "@/lib/format";
import type { ChildInput } from "@/lib/child/defaults";
import {
  CHILD_PHASE_LABEL,
  type ChildEstimate,
  type ChildSaveSchedule,
  type ChildYearRow,
} from "@/lib/child/estimateChild";
import { buildChildNarrative, childMilestones, potNote, readinessHeadline, saveTargetCopy } from "@/lib/child/narrative";

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;
const PINE: [number, number, number] = [29, 74, 56];
const INK: [number, number, number] = [20, 34, 28];
const MUTED: [number, number, number] = [90, 107, 98];
const PAPER: [number, number, number] = [243, 238, 228];

const INPUT_ROWS: { key: keyof ChildInput; label: string; kind: "age" | "money" | "years" | "percent" }[] = [
  { key: "childAge", label: "Child's age now", kind: "age" },
  { key: "yearsUntilBaby", label: "Years until the baby", kind: "years" },
  { key: "monthlyChildCostToday", label: "Child cost / month", kind: "money" },
  { key: "schoolStartAge", label: "School starts at age", kind: "age" },
  { key: "schoolAnnualToday", label: "School cost / year", kind: "money" },
  { key: "extraAnnualToday", label: "Co-curricular / year", kind: "money" },
  { key: "raisingSavings", label: "Already saved for raising", kind: "money" },
  { key: "raisingAnnualSave", label: "Yearly add to that pot", kind: "money" },
  { key: "universityStartAge", label: "University starts at age", kind: "age" },
  { key: "universityYears", label: "Years of university", kind: "years" },
  { key: "universityAnnualToday", label: "University cost / year", kind: "money" },
  { key: "universitySavings", label: "Already saved for university", kind: "money" },
  { key: "universityAnnualSave", label: "Yearly add to that pot", kind: "money" },
  { key: "inflationRate", label: "Inflation", kind: "percent" },
  { key: "educationInflationRate", label: "Education inflation", kind: "percent" },
  { key: "ageDemandRate", label: "Age-related increase", kind: "percent" },
  { key: "returnRate", label: "Return on these pots", kind: "percent" },
];

export function childPdfFilename(input: Pick<ChildInput, "childAge" | "yearsUntilBaby">): string {
  if (input.childAge > 0) return `child-nest-eggs-age-${input.childAge}.pdf`;
  if (input.yearsUntilBaby > 0) return `child-nest-eggs-baby-in-${input.yearsUntilBaby}-years.pdf`;
  return "child-nest-eggs.pdf";
}

export function compileChildPdf(result: ChildEstimate, generatedAt = new Date()): ArrayBuffer {
  const writer = new ReportWriter(generatedAt);
  writer.cover(result);
  writer.trainOfThought(result);
  writer.pots(result);
  writer.saveSchedule(result);
  writer.milestones(result);
  writer.costYears(result.years);
  writer.potYears(result.years);
  writer.assumptions(result.input);
  writer.closing();
  return writer.doc.output("arraybuffer");
}

export function downloadChildPdf(result: ChildEstimate): void {
  const bytes = compileChildPdf(result);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = childPdfFilename(result.input);
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

class ReportWriter {
  readonly doc: jsPDF;
  private y = MARGIN;
  private readonly generatedLabel: string;

  constructor(generatedAt: Date) {
    this.doc = new jsPDF({ unit: "pt", format: "letter", compress: false });
    this.generatedLabel = generatedAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    this.paintPageChrome();
  }

  cover(result: ChildEstimate) {
    const { readiness } = result;
    this.band(PINE, 46);
    this.doc.setTextColor(243, 238, 228);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9);
    this.doc.text("NEST EGGS FOR A CHILD", MARGIN, this.y - 28);
    this.doc.setFont("times", "bold");
    this.doc.setFontSize(22);
    this.doc.text("Child Nest-Egg Outlook", MARGIN, this.y - 8);

    this.space(16);
    this.muted(`Compiled ${this.generatedLabel}. Built in your browser from this run. Not stored on a server.`);
    this.space(10);
    this.doc.setFont("times", "bold");
    this.doc.setFontSize(16);
    this.doc.setTextColor(...INK);
    this.wrap(readinessHeadline(readiness), 16, 20);
    this.space(4);
    this.body(
      "A year-by-year map of living, school, extras, and university on two pots. Figures below are the current plan -- what you have and what you add -- plus the present value that would fund the raising years.",
    );

    this.space(12);
    const col = CONTENT_W / 3;
    this.metric("Present value through 18", formatMoney(readiness.presentValueThrough18), MARGIN, col - 8);
    this.metric(
      "Years until ready",
      readiness.childAlreadyHere
        ? "Child is here"
        : readiness.yearsUntilReady === null
          ? "Not at this rate"
          : String(readiness.yearsUntilReady),
      MARGIN + col,
      col - 8,
    );
    this.metric("School funded by the pot?", readiness.coversSchool ? "Yes" : "No", MARGIN + col * 2, col - 8);
    this.y += 36;
    this.body(
      `Living ${formatMoney(readiness.livingPresentValue)} · school plus extras ${formatMoney(readiness.schoolPresentValue)}.`,
    );
  }

  trainOfThought(result: ChildEstimate) {
    this.ensure(80);
    this.section("How we got here", "Train of thought -- this run's numbers.");
    this.body(
      "Read these steps in order. Each one uses the amounts on the form, not a national average.",
    );
    this.space(6);
    const steps = buildChildNarrative(result);
    for (let i = 0; i < steps.length; i += 1) {
      this.ensure(28);
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(10);
      this.doc.setTextColor(...PINE);
      this.doc.text(`${i + 1}.`, MARGIN, this.y);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(...INK);
      const lines = this.doc.splitTextToSize(steps[i], CONTENT_W - 18) as string[];
      for (const row of lines) {
        this.ensure(13);
        this.doc.setFontSize(10);
        this.doc.text(row, MARGIN + 18, this.y);
        this.y += 13;
      }
      this.space(4);
    }
  }

  pots(result: ChildEstimate) {
    this.ensure(90);
    this.section("The two nest eggs", "Needed today, then what you already have.");
    this.lineKV("Combined need today", formatMoney(result.combinedNeeded));
    this.lineKV("Already saved (both pots)", formatMoney(result.combinedHave));
    this.space(8);
    this.subhead("Through 18");
    this.lineKV("Nest egg needed today", formatMoney(result.raising.nestEggNeededNow));
    this.lineKV("Already saved", formatMoney(result.input.raisingSavings));
    this.lineKV(
      "Still needed, or extra / year",
      result.raising.alreadyEnough
        ? "Already enough"
        : `${formatMoney(result.raising.additionalNestEgg)} more, or ${formatMoney(result.raising.additionalAnnualSavings)} extra / year`,
    );
    if (result.raising.depletedAtAge !== null) {
      this.lineKV("Runs out at age (current plan)", String(result.raising.depletedAtAge));
    }
    this.body(potNote(result.raising, "until university starts"));
    this.space(8);
    this.subhead("University");
    this.lineKV("Nest egg needed today", formatMoney(result.university.nestEggNeededNow));
    this.lineKV("Already saved", formatMoney(result.input.universitySavings));
    this.lineKV(
      "Still needed, or extra / year",
      result.university.alreadyEnough
        ? "Already enough"
        : `${formatMoney(result.university.additionalNestEgg)} more, or ${formatMoney(result.university.additionalAnnualSavings)} extra / year`,
    );
    if (result.university.depletedAtAge !== null) {
      this.lineKV("Runs out at age (current plan)", String(result.university.depletedAtAge));
    }
    this.body(potNote(result.university, "until university starts"));

    if (result.warnings.length > 0) {
      this.space(8);
      this.subhead("Notes");
      for (const warning of result.warnings) {
        this.body(`- ${warning}`);
      }
    }
  }

  saveSchedule(result: ChildEstimate) {
    this.ensure(90);
    this.section("Yearly add to stay off salary", "Inverse of years until ready.");
    this.body(
      "Each figure is the yearly add during that window so the pot never goes negative. Shorter windows need a larger add. Extra is on top of the yearly add already on the form. Saving until university starts matches the form.",
    );
    this.space(8);
    this.subhead("Through 18");
    this.saveRows(result.raisingSave);
    this.space(8);
    this.subhead("University");
    this.saveRows(result.universitySave);
  }

  private saveRows(schedule: ChildSaveSchedule) {
    const rows: { label: string; target: ChildSaveSchedule["byBaby"] }[] = [
      { label: "By the baby", target: schedule.byBaby },
      { label: "By school start", target: schedule.bySchool },
      { label: "By university start", target: schedule.byUniversity },
    ];
    for (const row of rows) {
      const copy = saveTargetCopy(row.target);
      const window =
        row.target.years <= 0 ? "no years left to save" : `${row.target.years} year${row.target.years === 1 ? "" : "s"}`;
      this.lineKV(`${row.label} (${window})`, copy.value);
      this.body(copy.note);
    }
  }

  milestones(result: ChildEstimate) {
    const marks = childMilestones(result);
    if (marks.length === 0) return;
    this.ensure(70);
    this.section("Landmarks on the map", "The years that change the plan.");
    for (const mark of marks) {
      const when = mark.yearFromNow === 0 ? "This year" : `In ${mark.yearFromNow} year${mark.yearFromNow === 1 ? "" : "s"}`;
      const age = mark.childAge === null ? "before birth" : `age ${mark.childAge}`;
      this.lineKV(`${mark.label} (${age})`, when);
      this.body(mark.note);
    }
  }

  costYears(years: ChildYearRow[]) {
    if (years.length === 0) return;
    this.ensure(80);
    this.section("Costs through the years", "Every year from this run. Current plan.");
    this.body(
      "Living grows with inflation and age-related demand. School, extras, and university rise with education inflation. University is a separate column from raising.",
    );
    this.space(6);

    const cols = [
      { label: "Year", w: 36 },
      { label: "Age", w: 32 },
      { label: "Phase", w: 70 },
      { label: "Living", w: 62 },
      { label: "School", w: 62 },
      { label: "Extras", w: 62 },
      { label: "University", w: 72 },
      { label: "Total", w: 72 },
    ];
    this.tableHeader(cols);
    for (const row of years) {
      this.ensure(18);
      if (this.y < MARGIN + 40) this.tableHeader(cols);
      this.tableRow(cols, [
        String(row.yearFromNow),
        row.childAge === null ? "--" : String(row.childAge),
        CHILD_PHASE_LABEL[row.phase],
        formatMoney(row.living),
        formatMoney(row.school),
        formatMoney(row.extra),
        formatMoney(row.university),
        formatMoney(row.totalCost),
      ]);
    }
  }

  potYears(years: ChildYearRow[]) {
    if (years.length === 0) return;
    this.ensure(80);
    this.section("The two pots through the years", "What you have, plus yearly adds, minus that year's cost.");
    this.body(
      "Raising end is after return, the yearly add, and living + school + extras. After university starts, that column holds the leftover or the hole. University end is after return, the yearly add until university starts, and university cost. Negative means the current plan does not cover that year.",
    );
    this.space(6);

    const cols = [
      { label: "Year", w: 40 },
      { label: "Age", w: 36 },
      { label: "Add raising", w: 86 },
      { label: "Raising end", w: 90 },
      { label: "Add university", w: 96 },
      { label: "University end", w: 100 },
    ];
    this.tableHeader(cols);
    for (const row of years) {
      this.ensure(18);
      if (this.y < MARGIN + 40) this.tableHeader(cols);
      this.tableRow(cols, [
        String(row.yearFromNow),
        row.childAge === null ? "--" : String(row.childAge),
        formatMoney(row.raisingContribution),
        formatMoney(row.raisingEnd),
        formatMoney(row.universityContribution),
        formatMoney(row.universityEnd),
      ]);
    }
  }

  assumptions(input: ChildInput) {
    this.ensure(80);
    this.section("Inputs used for this report", "Copied from the form at the moment you compiled this PDF.");
    for (const row of INPUT_ROWS) {
      this.lineKV(row.label, formatInputValue(input[row.key], row.kind));
    }
  }

  closing() {
    this.ensure(70);
    this.space(8);
    this.section("About this report", "Educational projection only.");
    this.body(
      "This PDF is compiled on your device from the child outlook you just ran. It is not tax, investment, or medical advice. Markets, inflation, health, and policy can all move against any model. Compare this outlook with a licensed advisor before making decisions.",
    );
    this.space(4);
    this.body("Not stored on a server.");
  }

  private paintPageChrome() {
    this.doc.setFillColor(...PAPER);
    this.doc.rect(0, 0, PAGE_W, PAGE_H, "F");
    this.doc.setFillColor(...PINE);
    this.doc.rect(0, 0, PAGE_W, 8, "F");
    this.doc.setFillColor(...PINE);
    this.doc.rect(0, PAGE_H - 28, PAGE_W, 28, "F");
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    this.doc.setTextColor(243, 238, 228);
    this.doc.text("Nest Eggs for a Child", MARGIN, PAGE_H - 12);
    this.doc.text(`Page ${this.doc.getNumberOfPages()}`, PAGE_W - MARGIN, PAGE_H - 12, { align: "right" });
    this.y = MARGIN + 8;
  }

  private addPage() {
    this.doc.addPage();
    this.paintPageChrome();
  }

  private ensure(height: number) {
    if (this.y + height > PAGE_H - 40) this.addPage();
  }

  private space(n: number) {
    this.y += n;
  }

  private band(color: [number, number, number], height: number) {
    this.ensure(height + 8);
    this.doc.setFillColor(...color);
    this.doc.rect(0, this.y, PAGE_W, height, "F");
    this.y += height;
  }

  private section(title: string, eyebrow: string) {
    this.ensure(48);
    this.doc.setDrawColor(...PINE);
    this.doc.setLineWidth(2);
    this.doc.line(MARGIN, this.y, PAGE_W - MARGIN, this.y);
    this.y += 16;
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8);
    this.doc.setTextColor(...PINE);
    this.doc.text(eyebrow.toUpperCase(), MARGIN, this.y);
    this.y += 16;
    this.doc.setFont("times", "bold");
    this.doc.setFontSize(16);
    this.doc.setTextColor(...INK);
    this.doc.text(title, MARGIN, this.y);
    this.y += 14;
  }

  private subhead(title: string) {
    this.ensure(20);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(11);
    this.doc.setTextColor(...PINE);
    this.doc.text(title, MARGIN, this.y);
    this.y += 14;
  }

  private muted(text: string) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);
    this.doc.setTextColor(...MUTED);
    this.wrap(text, 9, 12);
  }

  private body(text: string) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);
    this.doc.setTextColor(...INK);
    this.wrap(text, 10, 13);
  }

  private wrap(text: string, size: number, line: number) {
    const lines = this.doc.splitTextToSize(text, CONTENT_W) as string[];
    for (const row of lines) {
      this.ensure(line);
      this.doc.setFontSize(size);
      this.doc.text(row, MARGIN, this.y);
      this.y += line;
    }
  }

  private metric(label: string, value: string, x: number, width: number) {
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(7);
    this.doc.setTextColor(...MUTED);
    this.doc.text(label.toUpperCase(), x, this.y);
    this.doc.setFont("times", "bold");
    this.doc.setFontSize(13);
    this.doc.setTextColor(...INK);
    const valueLines = this.doc.splitTextToSize(value, width) as string[];
    this.doc.text(valueLines[0] ?? value, x, this.y + 16);
  }

  private lineKV(label: string, value: string) {
    this.ensure(16);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);
    this.doc.setTextColor(...MUTED);
    this.doc.text(label, MARGIN, this.y);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...INK);
    this.doc.text(value, PAGE_W - MARGIN, this.y, { align: "right" });
    this.y += 14;
  }

  private tableHeader(cols: { label: string; w: number }[]) {
    this.ensure(18);
    this.doc.setFillColor(...PINE);
    this.doc.rect(MARGIN, this.y - 10, CONTENT_W, 16, "F");
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8);
    this.doc.setTextColor(243, 238, 228);
    let x = MARGIN + 4;
    for (const col of cols) {
      this.doc.text(col.label, x, this.y);
      x += col.w;
    }
    this.y += 12;
  }

  private tableRow(cols: { label: string; w: number }[], values: string[]) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    this.doc.setTextColor(...INK);
    let x = MARGIN + 4;
    for (let i = 0; i < cols.length; i += 1) {
      this.doc.text(values[i] ?? "", x, this.y);
      x += cols[i].w;
    }
    this.y += 13;
    this.doc.setDrawColor(220, 214, 200);
    this.doc.setLineWidth(0.4);
    this.doc.line(MARGIN, this.y - 10, PAGE_W - MARGIN, this.y - 10);
  }
}

function formatInputValue(value: number, kind: "age" | "money" | "years" | "percent"): string {
  if (kind === "money") return formatMoney(value);
  if (kind === "percent") return formatPercent(value);
  return String(value);
}
