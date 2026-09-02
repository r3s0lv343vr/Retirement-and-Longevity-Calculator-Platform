import { describe, expect, it } from "vitest";
import { HUB_NAME, HUB_TITLE } from "./brand";

describe("hub brand", () => {
  it("names the cluster Runaway Finance", () => {
    expect(HUB_NAME).toBe("Runaway Finance");
    expect(HUB_TITLE).toBe("Runaway Finance");
  });
});
