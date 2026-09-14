import { describe, expect, it } from "vitest";
import { MORTGAGE_DEFAULT } from "@/lib/mortgage/defaults";
import { estimateMortgage } from "@/lib/mortgage/estimateMortgage";
import { compileMortgagePdf, mortgagePdfFilename } from "./compileMortgagePdf";

describe("mortgage PDF", () => {
  it("builds a non-empty report from the default run", () => {
    const result = estimateMortgage(MORTGAGE_DEFAULT);
    const bytes = compileMortgagePdf(result, new Date("2026-09-14T00:00:00.000Z"));
    expect(bytes.byteLength).toBeGreaterThan(1000);
    expect(mortgagePdfFilename(MORTGAGE_DEFAULT)).toContain("mortgage");
  });
});
