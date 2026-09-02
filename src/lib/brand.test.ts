import { describe, expect, it } from "vitest";
import { HUB_NAME, HUB_TITLE } from "./brand";

describe("hub brand", () => {
  it("names the cluster My Runaway Finance", () => {
    expect(HUB_NAME).toBe("My Runaway Finance");
    expect(HUB_TITLE).toBe("My Runaway Finance");
  });
});
