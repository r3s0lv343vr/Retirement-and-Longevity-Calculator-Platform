import { describe, expect, it } from "vitest";
import { HUB_NAME, HUB_TITLE } from "./brand";

describe("hub brand", () => {
  it("names the cluster Runaway Finances", () => {
    expect(HUB_NAME).toBe("Runaway Finances");
    expect(HUB_TITLE).toBe("Runaway Finances");
  });
});
