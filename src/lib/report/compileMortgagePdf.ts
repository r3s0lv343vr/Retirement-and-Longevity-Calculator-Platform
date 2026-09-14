import { jsPDF } from "jspdf";
import { formatMoney, formatPercent } from "@/lib/format";
import type { MortgageEstimate, MortgagePath } from "@/lib/mortgage/estimateMortgage";

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;
const PINE: [number, number, number] = [29, 74, 56];
const INK: [number, number, number] = [20, 34, 28];
const MUTED: [number, number, number] = [90, 107, 98];
const PAPER: [number, number, number] = [243, 238, 228];

export function mortgagePdfFilename(input: { homePrice: number; termYears: number }): string {
  return `can-i-get-a-mortgage-${Math.round(input.homePrice)}-${input.termYears}yr.pdf`;
}

export function compileMortgagePdf(result: MortgageEstimate, generatedAt = new Date()): ArrayBuffer {
  const writer = new ReportWriter(generatedAt);
  writer.cover(result);
  writer.picture(result);
  writer.years(result.primary, "This loan");
  writer.firstFive(result.primary);
  if (result.monthsGained > 0) writer.extras(result);
  if (result.compare) writer.compare(result);
  writer.amortization(result.primary);
  writer.assumptions(result);
  writer.closing();
  return writer.doc.output("arraybuffer");
}

export function downloadMortgagePdf(result: MortgageEstimate): void {
  const bytes = compileMortgagePdf(result);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = mortgagePdfFilename(result.input);
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

  cover(result: MortgageEstimate) {
    this.band(PINE, 46);
    this.doc.setTextColor(243, 238, 228);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9);
    this.doc.text("CAN I GET A MORTGAGE", MARGIN, this.y - 28);
    this.doc.setFont("times", "bold");
    this.doc.setFontSize(22);
    this.doc.text("What this house actually costs", MARGIN, this.y - 8);
    this.space(16);
    this.muted(`Compiled ${this.generatedLabel}. Built in your browser from this run. Not stored on a server.`);
    this.space(10);
    this.doc.setFont("times", "bold");
    this.doc.setFontSize(16);
    this.doc.setTextColor(...INK);
    this.wrap(headline(result.status), 16, 20);
    this.space(8);
    this.body(
      `P&I ${formatMoney(result.primary.monthlyPI)} / month. Housing cost about ${formatMoney(result.primary.firstHousingMonthly)} / month. Interest ${formatMoney(result.primary.totalInterest)}. Cash to buy ${formatMoney(result.cashToBuy)}.`,
    );
    this.space(12);
    const col = CONTENT_W / 3;
    this.metric("Loan", formatMoney(result.primary.loanAmount), MARGIN, col - 8);
    this.metric("Pile at the end", formatMoney(result.primary.endingPile), MARGIN + col, col - 8);
    this.metric(
      "First draw",
      result.primary.firstDrawYear ? `Year ${result.primary.firstDrawYear}` : "None",
      MARGIN + col * 2,
      col - 8,
    );
    this.y += 40;
    this.body(
      "Educational projection only. It is not a pre-approval, a rate lock, or tax advice. Compare this outlook with a lender and a licensed advisor.",
    );
  }

  picture(result: MortgageEstimate) {
    this.ensure(90);
    this.section(
      "The big picture",
      `The house costs ${formatMoney(result.input.homePrice)}, but owning it on this path may take ${formatMoney(result.primary.totalHousingOutflow + result.cashToBuy)}.`,
    );
    this.lineKV("Borrowed", formatMoney(result.primary.loanAmount));
    this.lineKV("Housing cash outflow", formatMoney(result.primary.totalHousingOutflow));
    this.lineKV("Cash to buy", formatMoney(result.cashToBuy));
  }

  firstFive(path: MortgagePath) {
    this.ensure(80);
    this.section("First five years", "Payments, principal, interest, housing, remaining balance.");
    this.lineKV("Payments", formatMoney(path.firstFive.payments));
    this.lineKV("Principal repaid", formatMoney(path.firstFive.principal));
    this.lineKV("Interest", formatMoney(path.firstFive.interest));
    this.lineKV("Housing costs", formatMoney(path.firstFive.housing));
    this.lineKV("Remaining balance", formatMoney(path.firstFive.remaining));
  }

  extras(result: MortgageEstimate) {
    this.ensure(60);
    this.section("Extra payments", "Time gained and interest saved versus paying only the required amount.");
    this.lineKV("Extra / month", formatMoney(result.input.extraMonthly));
    this.lineKV("Months sooner", String(result.monthsGained));
    this.lineKV("Interest saved", formatMoney(result.interestSaved));
  }

  years(path: MortgagePath, title: string) {
    this.ensure(90);
    this.section(title, "Housing, insurance, leftover cash, and the pile at years 1, 5, and 10.");
    for (const year of [1, 5, 10]) {
      const row = path.years.find((item) => item.year === year);
      if (!row) continue;
      this.lineKV(
        `Year ${year}`,
        `Housing ${formatMoney(row.housing)} · insurance ${formatMoney(row.insurance)} · leftover ${formatMoney(row.leftover)} · pile ${formatMoney(row.endingPile)}`,
      );
    }
    if (path.pmiDropYear) this.lineKV("PMI ends", `Year ${path.pmiDropYear}`);
  }

  compare(result: MortgageEstimate) {
    if (!result.compare) return;
    this.ensure(80);
    this.section("Compare", "Same life costs and pile. Only the loan changes.");
    this.lineKV("This loan P&I", formatMoney(result.primary.monthlyPI));
    this.lineKV("This loan interest", formatMoney(result.primary.totalInterest));
    this.lineKV("Other loan P&I", formatMoney(result.compare.monthlyPI));
    this.lineKV("Other loan interest", formatMoney(result.compare.totalInterest));
  }

  amortization(path: MortgagePath) {
    this.ensure(80);
    this.section("Yearly amortization", "Principal, interest, PMI, remaining balance, pile.");
    for (const row of path.years) {
      this.ensure(16);
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(9);
      this.doc.setTextColor(...INK);
      this.doc.text(
        `Y${row.year}  P ${formatMoney(row.principal)}  I ${formatMoney(row.interest)}  PMI ${formatMoney(row.pmi)}  Bal ${formatMoney(row.endingBalance)}  Pile ${formatMoney(row.endingPile)}`,
        MARGIN,
        this.y,
      );
      this.y += 13;
    }
  }

  assumptions(result: MortgageEstimate) {
    this.ensure(90);
    this.section("What you entered", "The numbers this run used.");
    const { input } = result;
    this.lineKV("Price / down", `${formatMoney(input.homePrice)} / ${formatMoney(input.downPayment)}`);
    this.lineKV("Rate / term", `${formatPercent(input.annualRate, 2)} / ${input.termYears} years`);
    this.lineKV("Tax / insurance", `${formatMoney(input.propertyTaxAnnual)} / ${formatMoney(input.homeInsuranceAnnual)}`);
    this.lineKV("HOA / PMI / upkeep", `${formatMoney(input.hoaMonthly)} / mo · ${formatMoney(input.pmiMonthly)} / mo · ${formatMoney(input.maintenanceAnnual)}`);
    this.lineKV("Take-home / pile", `${formatMoney(input.annualIncome)} / ${formatMoney(input.investmentPile)}`);
    this.lineKV("Inflation / return", `${formatPercent(input.inflationRate, 1)} / ${formatPercent(input.investmentReturn, 1)}`);
    this.lineKV("Cash to buy pieces", `Close ${formatMoney(input.closingCost)} · move ${formatMoney(input.movingCost)} · furnish ${formatMoney(input.furnishingCost)}`);
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

function headline(status: MortgageEstimate["status"]): string {
  if (status === "comfortable") return "The house payment still leaves a buffer through year 10.";
  if (status === "buffered") return "The year is short, but the investment pile covers the gap.";
  if (status === "tight") return "Year one clears, then a later year gets tight.";
  if (status === "short") return "Year one does not clear after tax, insurance, and life costs.";
  return "The pile is emptied while the house and life still overflow.";
}
