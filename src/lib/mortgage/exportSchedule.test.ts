import { describe, expect, it } from "vitest";
import { MORTGAGE_DEFAULT } from "./defaults";
import { estimateMortgage } from "./estimateMortgage";
import { mortgageScheduleCsv } from "./exportSchedule";

describe("mortgage CSV", () => {
  it("writes a header and one row per month", () => {
    const csv = mortgageScheduleCsv(estimateMortgage(MORTGAGE_DEFAULT));
    const lines = csv.trim().split("\n");
    expect(lines[0]).toContain("Month");
    expect(lines.length).toBe(361);
  });
});
