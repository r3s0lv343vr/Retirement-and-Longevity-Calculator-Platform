import { describe, expect, it } from "vitest";
import { formatMonths } from "./format";

describe("formatMonths", () => {
  it("names whole years", () => {
    expect(formatMonths(372)).toBe("372 months (31 years)");
  });

  it("keeps leftover months", () => {
    expect(formatMonths(13)).toBe("13 months (1 year 1 month)");
  });

  it("handles less than a year", () => {
    expect(formatMonths(1)).toBe("1 month");
    expect(formatMonths(11)).toBe("11 months");
  });
});
