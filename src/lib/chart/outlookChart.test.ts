import { describe, expect, it } from "vitest";
import { DEFAULT_INPUT, project } from "@/lib/engine";
import { buildOutlookChartModel, outlookChartSeries } from "./outlookChart";

describe("buildOutlookChartModel", () => {
  it("builds a retirement series with a peak and bars", () => {
    const years = project(DEFAULT_INPUT).years;
    const series = outlookChartSeries(years);
    const model = buildOutlookChartModel(years);
    expect(series.every((row) => row.phase !== "working")).toBe(true);
    expect(model.line.length).toBe(series.length);
    expect(model.bars.length).toBe(series.length);
    expect(model.maxBalance).toBeGreaterThan(0);
    expect(model.ageTicks.length).toBe(5);
  });
});
