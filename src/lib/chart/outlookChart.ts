import type { YearRow } from "@/lib/engine";

export const CHART_WIDTH = 720;
export const CHART_HEIGHT = 280;

export type OutlookChartBar = {
  x: number;
  width: number;
  totalY: number;
  totalH: number;
  medicalY: number;
  medicalH: number;
};

export type OutlookChartModel = {
  width: number;
  height: number;
  pad: { top: number; right: number; bottom: number; left: number };
  maxBalance: number;
  minAge: number;
  maxAge: number;
  ageTicks: number[];
  line: { x: number; y: number }[];
  bars: OutlookChartBar[];
};

export function outlookChartSeries(years: YearRow[]): YearRow[] {
  const retired = years.filter((y) => y.phase !== "working");
  return retired.length > 0 ? retired : years;
}

export function buildOutlookChartModel(years: YearRow[]): OutlookChartModel {
  const series = outlookChartSeries(years);
  const width = CHART_WIDTH;
  const height = CHART_HEIGHT;
  const pad = { top: 20, right: 16, bottom: 36, left: 58 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxBalance = Math.max(...series.map((y) => y.endBalance), 1);
  const maxSpend = Math.max(...series.map((y) => y.totalSpend), 1);
  const minAge = series[0]?.age ?? 0;
  const maxAge = series.at(-1)?.age ?? minAge;
  const span = Math.max(maxAge - minAge, 1);
  const x = (age: number) => pad.left + ((age - minAge) / span) * innerW;
  const yBal = (v: number) => pad.top + innerH - (v / maxBalance) * innerH;
  const ySpend = (v: number) => pad.top + innerH - (v / maxSpend) * innerH * 0.45;
  const barW = Math.max(innerW / Math.max(series.length, 1) - 2, 2);
  const ticks = 5;

  return {
    width,
    height,
    pad,
    maxBalance,
    minAge,
    maxAge,
    ageTicks: Array.from({ length: ticks }, (_, i) => Math.round(minAge + (span * i) / (ticks - 1))),
    line: series.map((row) => ({ x: x(row.age), y: yBal(row.endBalance) })),
    bars: series.map((row) => {
      const medical = row.healthcareSpend + row.longTermCareSpend + row.housingSpend;
      const totalY = ySpend(row.totalSpend);
      const medicalY = ySpend(medical);
      const base = pad.top + innerH;
      return {
        x: x(row.age) - barW / 2,
        width: barW,
        totalY,
        totalH: Math.max(base - totalY, 0),
        medicalY,
        medicalH: Math.max(base - medicalY, 0),
      };
    }),
  };
}
