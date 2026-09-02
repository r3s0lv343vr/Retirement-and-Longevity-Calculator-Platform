import { describe, expect, it } from "vitest";
import { BUILDER_NAME, CONTACT_EMAIL, HUB_NAME, HUB_TITLE, HUB_WHY, OPERATOR_NAME } from "./brand";

describe("hub brand", () => {
  it("names the cluster Runaway Finance", () => {
    expect(HUB_NAME).toBe("Runaway Finance");
    expect(HUB_TITLE).toBe("Runaway Finance");
    expect(BUILDER_NAME).toBe("Curiosity Labz");
    expect(OPERATOR_NAME).toBe("C. Ferguson");
    expect(CONTACT_EMAIL).toContain("@");
    expect(HUB_WHY).toHaveLength(3);
    expect(HUB_WHY[0]).toContain("how long the money lasts");
  });
});
