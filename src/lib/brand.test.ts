import { describe, expect, it } from "vitest";
import { HUB_NAME, HUB_TITLE } from "./brand";

describe("hub brand", () => {
  it("names the cluster NestSpan, not retirement-only", () => {
    expect(HUB_NAME).toBe("NestSpan");
    expect(HUB_TITLE).toBe("NestSpan Calculators");
  });
});
