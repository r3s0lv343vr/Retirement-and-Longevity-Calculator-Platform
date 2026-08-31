import { jsPDF } from "jspdf";
import { buildOutlookChartModel } from "@/lib/chart/outlookChart";
import { drawdownStartPrimaryAge, FIELD_META, savingEndPrimaryAge } from "@/lib/engine";
import type { CalculatorInput, ComfortEstimate, Outlook, ProjectionResult, YearRow } from "@/lib/engine";
import { formatMoney, formatMonths, formatPercent } from "@/lib/format";

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;
const PINE: [number, number, number] = [29, 74, 56];
const INK: [number, number, number] = [20, 34, 28];
const MUTED: [number, number, number] = [90, 107, 98];
const PAPER: [number, number, number] = [243, 238, 228];

const PHASE_LABEL: Record<YearRow["phase"], string> = {
  working: "Working",
  "go-go": "Go-go",
  "slow-go": "Slow-go",
  "no-go": "No-go",
};

const INPUT_GROUPS: { id: CalculatorInputGroup; label: string }[] = [
  { id: "timeline", label: "Timeline" },
  { id: "savings", label: "Savings and growth" },
  { id: "work", label: "Phased work" },
  { id: "income", label: "Guaranteed income" },
  { id: "partner", label: "Second person" },
  { id: "spending", label: "Spending" },
  { id: "housing", label: "Later-life housing" },
  { id: "assumptions", label: "Rates" },
  { id: "phases", label: "Lifestyle phases" },
];

type CalculatorInputGroup = (typeof FIELD_META)[keyof typeof FIELD_META]["group"];

export function outlookPdfFilename(input: Pick<CalculatorInput, "currentAge" | "planToAge">): string {
  return `longevity-outlook-age-${input.currentAge}-to-${input.planToAge}.pdf`;
}

export function compileOutlookPdf(result: ProjectionResult, generatedAt = new Date()): ArrayBuffer {
  const writer = new ReportWriter(generatedAt);
  writer.cover(result);
  writer.comfort(result);
  writer.enteredPlan(result);
  writer.portfolioChart(result.years);
  writer.capitalMonths(result.outlook);
  writer.yearByYear(result.years, result.input.twoPerson);
  writer.assumptions(result.input);
  writer.closing();
  return writer.doc.output("arraybuffer");
}

export function downloadOutlookPdf(result: ProjectionResult): void {
  const bytes = compileOutlookPdf(result);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = outlookPdfFilename(result.input);
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

  cover(result: ProjectionResult) {
    const { outlook } = result;
    this.band(PINE, 46);
    this.doc.setTextColor(243, 238, 228);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9);
    this.doc.text("HOW LONG BEFORE I GO BROKE CALCULATOR", MARGIN, this.y - 28);
    this.doc.setFont("times", "bold");
    this.doc.setFontSize(22);
    this.doc.text("Retirement Longevity Outlook", MARGIN, this.y - 8);

    this.space(16);
    this.muted(`Compiled ${this.generatedLabel}. Built in your browser from this run. Not stored on a server.`);
    this.space(10);
    this.doc.setFont("times", "bold");
    this.doc.setFontSize(16);
    this.doc.setTextColor(...INK);
    this.wrap(outlook.title, 16, 20);
    this.space(4);
    this.body(outlook.summary);

    this.space(12);
    const col = CONTENT_W / 3;
    this.metric("Funded through age", String(outlook.fundedThroughAge), MARGIN, col - 8);
    this.metric(
      "Balance at target",
      outlook.depleted ? "Depleted" : formatMoney(outlook.endingBalance),
      MARGIN + col,
      col - 8,
    );
    this.metric(
      "Years of retirement covered",
      `${outlook.yearsCovered} of ${outlook.yearsInRetirement}`,
      MARGIN + col * 2,
      col - 8,
    );
    this.y += 36;
  }

  comfort(result: ProjectionResult) {
    const { comfort, input } = result;
    this.ensure(120);
    this.section("Comfortable living", "Suggested alternative -- not your entered plan");
    this.body(
      "Optional. This is a higher national-style budget you can aim for -- not the outlook from the form. It uses the higher of your lifestyle spending and a $65,000 floor, adds a 10% buffer, and keeps healthcare no lower than a typical premium-plus-care amount. Later-life housing is included only if you entered it.",
    );
    this.space(8);
    const col = CONTENT_W / 3;
    this.metric("Comfortable budget / year", formatMoney(comfort.suggestedAnnualBudgetToday), MARGIN, col - 8);
    this.metric("Nest egg to fund it", formatMoney(comfort.nestEggNeededNow), MARGIN + col, col - 8);
    this.metric(
      "Extra to save / year",
      comfort.additionalNestEgg <= 0 ? "$0" : formatMoney(comfort.additionalAnnualSavings),
      MARGIN + col * 2,
      col - 8,
    );
    this.y += 36;
    this.body(comfortSaveLine(comfort, input.currentSavings));
    if (comfort.usedHousingPlaceholder) {
      this.space(4);
      this.body(
        "Housing placeholder is included in the nest-egg figure. Enter your own senior, nursing, or CCRC rent to replace it.",
      );
    }
  }

  enteredPlan(result: ProjectionResult) {
    const { outlook, input } = result;
    this.ensure(80);
    this.section("Your entered plan", "The figures below use the amounts on the form. They are not the comfortable-living suggestion.");

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(11);
    this.doc.setTextColor(...PINE);
    this.lineKV("Nest egg + later income", formatMoney(outlook.fundingTotal));
    this.body(
      `From your entered plan: ${formatMoney(outlook.nestEggAtRetirement)} at retirement + ${formatMoney(outlook.retirementIncomeTotal)} after full-time work ends.`,
    );

    this.space(8);
    this.subhead("Nest egg at retirement");
    this.lineKV("Total at retirement", formatMoney(outlook.nestEggAtRetirement));
    this.lineKV("Future value of current savings", formatMoney(outlook.nestEggLump));
    this.lineKV("Annuity of annual savings", formatMoney(outlook.nestEggAnnuity));
    this.body(
      outlook.nestEggYears > 0
        ? input.savingsGrowWithInflation
          ? `Total future value at age ${input.retirementAge}: current savings grown as a lump, plus annual savings that rise with inflation (${outlook.nestEggYears} years at ${(input.preRetirementReturn * 100).toFixed(1)}%).`
          : `Total future value at age ${input.retirementAge}: current savings grown as a lump, plus annual savings as an ordinary annuity (${outlook.nestEggYears} years at ${(input.preRetirementReturn * 100).toFixed(1)}%).`
        : "Full-time work has already ended, so this is the savings on hand today.",
    );

    this.space(8);
    this.subhead("Income after full-time work ends");
    this.lineKV("Total later income", formatMoney(outlook.retirementIncomeTotal));
    this.lineKV("Social Security", formatMoney(outlook.socialSecurityTotal));
    this.lineKV("Pension", formatMoney(outlook.pensionTotal));
    this.lineKV("Pay while still working", formatMoney(outlook.workIncomeTotal));
    this.lineKV("Part-time / side-hustle wages", formatMoney(outlook.partTimeWages));
    this.lineKV("Extra savings during phased work", formatMoney(outlook.partTimeInvested));

    this.space(8);
    this.subhead("All spending through last funded year");
    this.lineKV("All spending", formatMoney(outlook.totalRetirementSpend));
    this.lineKV("Lifestyle", formatMoney(outlook.totalLifestyleSpend));
    this.lineKV("Routine healthcare", formatMoney(outlook.totalHealthcareSpend));
    this.lineKV("Long-term care", formatMoney(outlook.totalLongTermCareSpend));
    this.lineKV("Later-life facility rent", formatMoney(outlook.totalHousingSpend));
    this.body(
      `Lifestyle plus healthcare through age ${outlook.fundedThroughAge}. Healthcare is only part of this total. Nest egg plus later income is ${formatMoney(outlook.fundingTotal)}; remaining-balance growth in retirement covers some of the difference.`,
    );

    this.space(8);
    this.subhead("Healthcare and care");
    this.lineKV("Healthcare and care total", formatMoney(outlook.totalMedicalSpend));
    this.lineKV("Healthcare and housing share", formatPercent(outlook.healthcareShare));
    this.lineKV("Peak care year", outlook.peakHealthcareAge ? `Age ${outlook.peakHealthcareAge}` : "--");
    this.lineKV(
      "Peak care spend",
      outlook.peakHealthcareSpend ? formatMoney(outlook.peakHealthcareSpend) : "--",
    );
    this.lineKV("Part-time income (total)", formatMoney(outlook.partTimeTotal));

    if (input.twoPerson) {
      this.space(8);
      this.subhead("Two persons and the survivor");
      this.lineKV("Work ends (you / partner)", `${input.retirementAge} / ${input.partnerRetirementAge}`);
      this.lineKV("Drawdowns start (your age)", `Age ${drawdownStartPrimaryAge(input)}`);
      this.lineKV("Yearly saving through (your age)", `Age ${savingEndPrimaryAge(input)}`);
      this.lineKV("Plan through (you / partner)", `${input.planToAge} / ${input.partnerPlanToAge}`);
      this.lineKV(
        "Household horizon (your age)",
        `Age ${outlook.householdHorizonAge}`,
      );
      this.lineKV(
        "First death (your age)",
        outlook.firstDeathPrimaryAge == null ? "Same year" : `Age ${outlook.firstDeathPrimaryAge}`,
      );
      this.lineKV(
        "Funded through (you / partner)",
        outlook.partnerFundedThroughAge != null
          ? `${outlook.fundedThroughAge} / ${outlook.partnerFundedThroughAge}`
          : String(outlook.fundedThroughAge),
      );
      this.body(
        "One nest egg and one set of market returns. Drawdowns start at the earlier work-end; yearly saving continues until the later work-end. After the first death, Social Security becomes the larger of the two checks; a pension continues only by the survivor share on the form. Lifestyle then uses the survivor factor. If only one person is in nursing, household lifestyle is not cut.",
      );
    }

    this.space(8);
    this.subhead("Not a straight line");
    const straight =
      `A model that holds spending flat except for CPI would say you last until age ${outlook.straightLineFundedThroughAge}` +
      (outlook.straightLineEndingBalance > 0 ? ` with ${formatMoney(outlook.straightLineEndingBalance)} left` : "") +
      `. Accounting for healthcare inflation, age-driven medical costs, lifestyle phases, later-life housing, and care, this plan funds through age ${outlook.fundedThroughAge}` +
      (outlook.longevityGapYears > 0
        ? ` -- ${outlook.longevityGapYears} year${outlook.longevityGapYears === 1 ? "" : "s"} sooner.`
        : ".");
    this.body(straight);
    this.space(4);
    this.body(
      `The same plan with a weak first decade -- ${(outlook.badDecadeReturn * 100).toFixed(1)}% a year for the first 10 years of retirement, then your usual ${(input.postRetirementReturn * 100).toFixed(1)}% -- lasts through age ${outlook.badDecadeFundedThroughAge}` +
        (outlook.badDecadeEndingBalance > 0 ? ` with ${formatMoney(outlook.badDecadeEndingBalance)} left` : "") +
        (outlook.badDecadeGapYears > 0
          ? ` -- ${outlook.badDecadeGapYears} year${outlook.badDecadeGapYears === 1 ? "" : "s"} sooner than the usual-return path.`
          : ".") +
        " A straight-line return is the optimistic path.",
    );

    this.space(8);
    this.subhead("Social Security at 67 vs 70");
    this.body(
      `Your outlook still uses the check and start age on the form (${formatMoney(input.socialSecurityAnnual)} starting at ${input.socialSecurityStartAge}). This compare scales that check the way delayed retirement credits work in the U.S. -- full retirement age 67, and age 70 is 24% higher -- then runs the same spending path with fewer years of checks.`,
    );
    this.lineKV("Claim at 67 / year (today)", formatMoney(outlook.claiming67Annual));
    this.lineKV("Claim at 67 funded through", `Age ${outlook.claiming67FundedThroughAge}`);
    this.lineKV("Claim at 70 / year (today)", formatMoney(outlook.claiming70Annual));
    this.lineKV("Claim at 70 funded through", `Age ${outlook.claiming70FundedThroughAge}`);

    if (result.warnings.length > 0) {
      this.space(8);
      this.subhead("Notes");
      for (const warning of result.warnings) {
        this.body(`- ${warning}`);
      }
    }
  }

  portfolioChart(years: YearRow[]) {
    const chartH = 168;
    this.ensure(chartH + 90);
    this.section("Portfolio vs. changing costs", "Entered-plan chart");
    this.body(
      "The green line is the nest egg. The dollar figure at the top left is the peak portfolio, not a year of spending. Bars are each year of drawdown on a smaller scale: beige is total spending, brown is healthcare, long-term care, and facility rent.",
    );
    this.space(8);
    this.drawChart(years, CONTENT_W, chartH);
    this.y += 10;
    this.muted("Portfolio line. Beige bars: total spending. Brown bars: healthcare, care, and housing.");
  }

  capitalMonths(outlook: Outlook) {
    this.ensure(90);
    this.section("How long the capital lasts", "Capital months -- entered plan");
    this.body(
      "Months of retirement your plan needs, versus months the accumulated capital actually covers. This uses the amounts on the form, not the comfortable-living suggestion.",
    );
    this.space(6);
    this.lineKV("Months of capital required", formatMonths(outlook.requiredMonths));
    this.body("From full-time work ending through your plan-through age.");
    this.lineKV("Months of capital accumulated", formatMonths(outlook.accumulatedMonths));
    this.body(
      outlook.surpassesRequiredMonths
        ? `Until leftover savings would run out. This surpasses the required ${formatMonths(outlook.requiredMonths)}.`
        : outlook.depleted
          ? "Until savings run out."
          : "Until the end of the plan.",
    );
    this.space(4);
    this.body(
      outlook.surpassesRequiredMonths
        ? `Savings remaining at the plan-through age: ${formatMoney(outlook.remainingSavings)}.`
        : outlook.remainingExpenseNeed > 0
          ? `Savings still required for remaining expenses after capital runs out: ${formatMoney(outlook.remainingExpenseNeed)}.`
          : `Savings remaining: ${formatMoney(outlook.remainingSavings)}.`,
    );
  }

  yearByYear(years: YearRow[], twoPerson = false) {
    const retired = years.filter((y) => y.phase !== "working");
    const rows = retired.length > 0 ? retired : years;
    this.ensure(80);
    this.section("Year-by-year snapshot", "Every retirement year from this run.");

    const cols = twoPerson
      ? [
          { label: "Age", w: 32 },
          { label: "Partner", w: 40 },
          { label: "Phase", w: 58 },
          { label: "Lifestyle", w: 70 },
          { label: "Healthcare", w: 70 },
          { label: "Housing", w: 70 },
          { label: "Income", w: 70 },
          { label: "Balance", w: 74 },
        ]
      : [
          { label: "Age", w: 36 },
          { label: "Phase", w: 70 },
          { label: "Lifestyle", w: 78 },
          { label: "Healthcare", w: 78 },
          { label: "Housing", w: 78 },
          { label: "Income", w: 78 },
          { label: "Balance", w: 86 },
        ];

    this.tableHeader(cols);
    for (const row of rows) {
      this.ensure(18);
      if (this.y < MARGIN + 40) this.tableHeader(cols);
      const values = twoPerson
        ? [
            String(row.age),
            row.partnerAge == null ? "--" : String(row.partnerAge),
            PHASE_LABEL[row.phase],
            formatMoney(row.lifestyleSpend),
            formatMoney(row.healthcareSpend + row.longTermCareSpend),
            formatMoney(row.housingSpend),
            formatMoney(row.guaranteedIncome + row.partTimeIncome + row.workIncome),
            formatMoney(row.endBalance),
          ]
        : [
            String(row.age),
            PHASE_LABEL[row.phase],
            formatMoney(row.lifestyleSpend),
            formatMoney(row.healthcareSpend + row.longTermCareSpend),
            formatMoney(row.housingSpend),
            formatMoney(row.guaranteedIncome + row.partTimeIncome + row.workIncome),
            formatMoney(row.endBalance),
          ];
      this.tableRow(cols, values);
    }
  }

  assumptions(input: CalculatorInput) {
    this.ensure(80);
    this.section("Inputs used for this report", "Copied from the form at the moment you compiled this PDF.");
    for (const group of INPUT_GROUPS) {
      const keys = (Object.keys(FIELD_META) as (keyof CalculatorInput)[]).filter((key) => {
        if (FIELD_META[key].group !== group.id) return false;
        if (
          !input.twoPerson &&
          (FIELD_META[key].group === "partner" ||
            key === "partnerCurrentAge" ||
            key === "partnerRetirementAge" ||
            key === "partnerPlanToAge" ||
            key === "annualWorkIncome" ||
            key === "partnerAnnualWorkIncome")
        ) {
          return false;
        }
        return true;
      });
      if (keys.length === 0) continue;
      this.ensure(22 + keys.length * 14);
      this.subhead(group.label);
      for (const key of keys) {
        this.lineKV(FIELD_META[key].label, formatInputValue(key, input[key]));
      }
    }
  }

  closing() {
    this.ensure(70);
    this.space(8);
    this.section("About this report", "Educational projection only.");
    this.body(
      "This PDF is compiled on your device from the outlook you just ran. It is not tax, investment, or medical advice. Markets, inflation, health, and policy can all move against any model. Compare this outlook with a licensed advisor before making decisions.",
    );
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
    this.doc.text("How Long Before I Go Broke Calculator", MARGIN, PAGE_H - 12);
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

  private drawChart(years: YearRow[], drawW: number, drawH: number) {
    const model = buildOutlookChartModel(years);
    const originX = MARGIN;
    const originY = this.y;
    const sx = drawW / model.width;
    const sy = drawH / model.height;
    const mapX = (x: number) => originX + x * sx;
    const mapY = (y: number) => originY + y * sy;

    this.doc.setFillColor(255, 255, 255);
    this.doc.rect(originX, originY, drawW, drawH, "F");
    this.doc.setDrawColor(220, 214, 200);
    this.doc.setLineWidth(0.6);
    this.doc.rect(originX, originY, drawW, drawH, "S");

    const innerH = model.height - model.pad.top - model.pad.bottom;
    this.doc.setDrawColor(20, 34, 28);
    this.doc.setLineWidth(0.3);
    for (let i = 0; i < 4; i += 1) {
      const yy = mapY(model.pad.top + (innerH * i) / 3);
      this.doc.line(mapX(model.pad.left), yy, mapX(model.width - model.pad.right), yy);
    }

    for (const bar of model.bars) {
      this.doc.setFillColor(230, 212, 168);
      this.doc.rect(mapX(bar.x), mapY(bar.totalY), bar.width * sx, bar.totalH * sy, "F");
      this.doc.setFillColor(184, 92, 56);
      this.doc.rect(mapX(bar.x), mapY(bar.medicalY), bar.width * sx, bar.medicalH * sy, "F");
    }

    if (model.line.length > 1) {
      this.doc.setDrawColor(...PINE);
      this.doc.setLineWidth(1.6);
      for (let i = 1; i < model.line.length; i += 1) {
        const a = model.line[i - 1];
        const b = model.line[i];
        this.doc.line(mapX(a.x), mapY(a.y), mapX(b.x), mapY(b.y));
      }
    }

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    this.doc.setTextColor(...MUTED);
    this.doc.text(`Peak ${formatMoney(model.maxBalance)}`, mapX(8), mapY(16));
    const span = Math.max(model.maxAge - model.minAge, 1);
    for (const age of model.ageTicks) {
      const x =
        model.pad.left + ((age - model.minAge) / span) * (model.width - model.pad.left - model.pad.right);
      this.doc.text(String(age), mapX(x), mapY(model.height - 10), { align: "center" });
    }

    this.y = originY + drawH + 8;
  }
}

function comfortSaveLine(comfort: ComfortEstimate, currentSavings: number): string {
  if (comfort.additionalNestEgg <= 0) {
    return "On this suggested budget, your current nest egg is already enough in this model. The breakdown below still uses the amounts you entered.";
  }
  if (comfort.yearsToRetirement > 0) {
    return `That is ${formatMoney(comfort.additionalNestEgg)} more than the ${formatMoney(currentSavings)} you entered. Saving about ${formatMoney(comfort.additionalAnnualSavings)} extra per year until retirement is one way this alternative may last through your plan age.`;
  }
  return `That is ${formatMoney(comfort.additionalNestEgg)} more than the ${formatMoney(currentSavings)} you entered. Because retirement is already here, this alternative is a nest-egg gap rather than extra yearly saving.`;
}

function formatInputValue(key: keyof CalculatorInput, value: CalculatorInput[keyof CalculatorInput]): string {
  const kind = FIELD_META[key].kind;
  if (kind === "toggle") return value ? "On" : "Off";
  if (kind === "money") return formatMoney(Number(value));
  if (kind === "percent") return formatPercent(Number(value));
  if (kind === "multiplier") return `${Number(value).toFixed(2)}x`;
  return String(value);
}
