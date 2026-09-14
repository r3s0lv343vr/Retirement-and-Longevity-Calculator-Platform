import { jsPDF } from "jspdf";
import { formatMoney, formatPercent, formatYearsMonths } from "@/lib/format";
import { formatYearMonth } from "@/lib/mortgage/payoff";
import type { PayoffMortgageInput, PayoffStudio } from "@/lib/mortgage/payoff";

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;
const PINE: [number, number, number] = [29, 74, 56];
const INK: [number, number, number] = [20, 34, 28];
const MUTED: [number, number, number] = [90, 107, 98];
const PAPER: [number, number, number] = [243, 238, 228];

export function payoffPdfFilename(input: PayoffMortgageInput): string {
  return `mortgage-payoff-${Math.round(input.balance)}-${Math.round(input.extraMonthly)}extra.pdf`;
}

export function compilePayoffPdf(studio: PayoffStudio, generatedAt = new Date()): ArrayBuffer {
  const writer = new ReportWriter(generatedAt);
  writer.cover(studio);
  writer.shownPath(studio);
  writer.freedom(studio);
  writer.comparison(studio);
  writer.timing(studio);
  writer.temporary(studio);
  writer.milestones(studio);
  writer.amortization(studio);
  writer.assumptions(studio);
  writer.closing();
  return writer.doc.output("arraybuffer");
}

export function downloadPayoffPdf(studio: PayoffStudio, input: PayoffMortgageInput): void {
  const bytes = compilePayoffPdf(studio);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = payoffPdfFilename(input);
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

  cover(studio: PayoffStudio) {
    this.band(PINE, 46);
    this.doc.setTextColor(243, 238, 228);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9);
    this.doc.text("HOW MUCH FASTER CAN I PAY OFF MY MORTGAGE", MARGIN, this.y - 28);
    this.doc.setFont("times", "bold");
    this.doc.setFontSize(22);
    this.doc.text("Time reclaimed", MARGIN, this.y - 8);
    this.space(16);
    this.muted(`Compiled ${this.generatedLabel}. Built in your browser from this run. Not stored on a server.`);
    this.space(10);
    this.doc.setFont("times", "bold");
    this.doc.setFontSize(16);
    this.doc.setTextColor(...INK);
    this.wrap(headline(studio), 16, 20);
    this.space(8);
    const { selected, baseline, mortgage } = studio;
    this.body(
      `${selected.name}: ${selected.payoffDate ? formatYearMonth(selected.payoffDate) : "does not finish"} versus ${baseline.payoffDate ? formatYearMonth(baseline.payoffDate) : "an open-ended loan"}. Interest avoided ${formatMoney(Math.max(0, baseline.interestPaid - selected.interestPaid))}. Scheduled P&I ${formatMoney(mortgage.scheduledPayment)}.`,
    );
    this.space(12);
    const col = CONTENT_W / 3;
    this.metric("Balance", formatMoney(mortgage.balance), MARGIN, col - 8);
    this.metric("Time sooner", formatYearsMonths(Math.max(0, baseline.periods - selected.periods)), MARGIN + col, col - 8);
    this.metric(
      "Interest avoided",
      formatMoney(Math.max(0, baseline.interestPaid - selected.interestPaid)),
      MARGIN + col * 2,
      col - 8,
    );
    this.y += 40;
    this.body(
      "Educational estimate only. Extra payments are applied to principal and do not recast the scheduled payment. Compare this outlook with your servicer.",
    );
  }

  shownPath(studio: PayoffStudio) {
    this.ensure(80);
    this.section("Shown path", `${studio.selected.name} versus the scheduled payment with no extras.`);
    this.lineKV("Original payoff", studio.baseline.payoffDate ? formatYearMonth(studio.baseline.payoffDate) : "Does not finish");
    this.lineKV("This path", studio.selected.payoffDate ? formatYearMonth(studio.selected.payoffDate) : "Does not finish");
    this.lineKV("Extra paid", formatMoney(studio.selected.extraPaid));
    this.lineKV("Interest paid", formatMoney(studio.selected.interestPaid));
  }

  freedom(studio: PayoffStudio) {
    this.ensure(70);
    this.section("Freedom date", "The extra monthly principal that hits the date you chose.");
    this.lineKV("Target", formatYearMonth(studio.freedom.target));
    if (!studio.freedom.possible) {
      this.lineKV("Result", studio.freedom.reason ?? "Not possible");
      return;
    }
    this.lineKV(
      "Extra needed",
      studio.freedom.alreadyThere ? "Already there on the scheduled payment" : formatMoney(studio.freedom.extraMonthly),
    );
    this.lineKV("Total P&I", formatMoney(studio.freedom.totalPayment));
  }

  comparison(studio: PayoffStudio) {
    this.ensure(80);
    this.section("Strategy comparison", "Baseline, quick extra, and named plans.");
    for (const row of studio.comparison) {
      this.ensure(16);
      this.lineKV(
        row.name,
        `${row.payoffDate ? formatYearMonth(row.payoffDate) : "Does not finish"} · ${formatYearsMonths(row.periodsSaved)} sooner · interest avoided ${formatMoney(row.interestAvoided)}`,
      );
    }
  }

  timing(studio: PayoffStudio) {
    if (studio.timing.length === 0) return;
    this.ensure(80);
    this.section("Timing laboratory", "The same annual cash, applied in four calendars.");
    for (const row of studio.timing) {
      this.lineKV(
        row.name,
        `${row.result.payoffDate ? formatYearMonth(row.result.payoffDate) : "—"} · ${formatYearsMonths(row.periodsSaved)} sooner · ${formatMoney(row.interestAvoided)} avoided`,
      );
    }
  }

  temporary(studio: PayoffStudio) {
    this.ensure(70);
    this.section("Temporary acceleration", "The same extra for 2, 5, or 10 years, then back to the scheduled payment.");
    for (const row of studio.temporary) {
      this.lineKV(
        `${row.years} years`,
        `${formatYearsMonths(row.periodsSaved)} sooner · ${formatMoney(row.interestAvoided)} avoided`,
      );
    }
  }

  milestones(studio: PayoffStudio) {
    this.ensure(70);
    this.section("Milestones", `Dates on ${studio.selected.name}.`);
    for (const row of studio.selected.milestones) {
      this.lineKV(row.label, `${formatYearMonth(row.date)} · ${formatMoney(row.balance)} left`);
    }
  }

  amortization(studio: PayoffStudio) {
    this.ensure(80);
    this.section("Yearly amortization", "Interest, extra principal, remaining balance on the shown path.");
    for (const row of studio.selected.years) {
      this.ensure(16);
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(9);
      this.doc.setTextColor(...INK);
      this.doc.text(
        `${row.calendarYear}  I ${formatMoney(row.interest)}  Extra ${formatMoney(row.extra)}  Bal ${formatMoney(row.endingBalance)}`,
        MARGIN,
        this.y,
      );
      this.y += 13;
    }
  }

  assumptions(studio: PayoffStudio) {
    const { mortgage } = studio;
    this.ensure(90);
    this.section("What this run used", "Balance, rate, scheduled payment, and first-payment month.");
    this.lineKV("Balance", formatMoney(mortgage.balance));
    this.lineKV("Rate", formatPercent(mortgage.annualRate, 2));
    this.lineKV("Scheduled P&I", formatMoney(mortgage.scheduledPayment));
    this.lineKV("First payment", formatYearMonth(mortgage.start));
    this.lineKV("Scheduled term", `${mortgage.remainingPeriods} months`);
  }

  closing() {
    this.ensure(40);
    this.space(12);
    this.muted("Runaway Finance. Educational planning tool. Not a Certified Financial Planner substitute.");
  }

  private paintPageChrome() {
    this.doc.setFillColor(...PAPER);
    this.doc.rect(0, 0, PAGE_W, PAGE_H, "F");
    this.y = MARGIN + 36;
  }

  private band(color: [number, number, number], height: number) {
    this.doc.setFillColor(...color);
    this.doc.rect(0, 0, PAGE_W, height + 36, "F");
    this.y = height + 28;
  }

  private section(title: string, note: string) {
    this.doc.setFont("times", "bold");
    this.doc.setFontSize(14);
    this.doc.setTextColor(...PINE);
    this.doc.text(title, MARGIN, this.y);
    this.y += 16;
    this.muted(note);
    this.space(8);
  }

  private body(text: string) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);
    this.doc.setTextColor(...INK);
    this.wrap(text, 10, 13);
  }

  private muted(text: string) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);
    this.doc.setTextColor(...MUTED);
    this.wrap(text, 9, 12);
  }

  private lineKV(label: string, value: string) {
    this.ensure(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9);
    this.doc.setTextColor(...PINE);
    this.doc.text(label, MARGIN, this.y);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...INK);
    const lines = this.doc.splitTextToSize(value, CONTENT_W - 140) as string[];
    this.doc.text(lines[0] ?? "", MARGIN + 140, this.y);
    this.y += 14;
    for (const extra of lines.slice(1)) {
      this.ensure(12);
      this.doc.text(extra, MARGIN + 140, this.y);
      this.y += 12;
    }
  }

  private metric(label: string, value: string, x: number, width: number) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    this.doc.setTextColor(...MUTED);
    this.doc.text(label, x, this.y);
    this.doc.setFont("times", "bold");
    this.doc.setFontSize(12);
    this.doc.setTextColor(...INK);
    const lines = this.doc.splitTextToSize(value, width) as string[];
    this.doc.text(lines[0] ?? "", x, this.y + 14);
  }

  private wrap(text: string, size: number, leading: number) {
    this.doc.setFontSize(size);
    const lines = this.doc.splitTextToSize(text, CONTENT_W) as string[];
    for (const line of lines) {
      this.ensure(leading);
      this.doc.text(line, MARGIN, this.y);
      this.y += leading;
    }
  }

  private space(n: number) {
    this.y += n;
  }

  private ensure(need: number) {
    if (this.y + need < PAGE_H - 40) return;
    this.doc.addPage();
    this.paintPageChrome();
  }
}

function headline(studio: PayoffStudio): string {
  const saved = Math.max(0, studio.baseline.periods - studio.selected.periods);
  if (studio.selected.neverPaysOff) return "This path never retires the balance at the payment you entered.";
  if (saved <= 0) return "The current path matches the original payoff date.";
  return `You could be mortgage-free ${formatYearsMonths(saved)} sooner.`;
}
