import { describe, expect, it } from "vitest";
import { formatMonths, formatYearsMonths } from "./format";

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

describe("formatYearsMonths", () => {
  it("leads with years reclaimed", () => {
    expect(formatYearsMonths(36)).toBe("3 years");
    expect(formatYearsMonths(13)).toBe("1 year 1 month");
    expect(formatYearsMonths(1)).toBe("1 month");
  });
});
