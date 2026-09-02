import { describe, expect, it } from "vitest";
import { AD_SLOT_USAGE, AD_SLOTS, adsLive, adsensePublisherId, adsenseSlotId, calculatorAdGridClass } from "./ads";

describe("AdSense helpers", () => {
  it("accepts a publisher id and a display unit id", () => {
    expect(adsensePublisherId("ca-pub-1234567890123456")).toBe("ca-pub-1234567890123456");
    expect(adsensePublisherId("pub-123")).toBeNull();
    expect(adsensePublisherId("")).toBeNull();
    expect(adsenseSlotId("1234567890")).toBe("1234567890");
    expect(adsenseSlotId("header-leaderboard")).toBeNull();
    expect(adsLive("")).toBe(false);
    expect(adsLive("ca-pub-1234567890123456")).toBe(true);
    expect(calculatorAdGridClass("")).toBe("min-w-0");
    expect(calculatorAdGridClass("ca-pub-1234567890123456")).toContain("160px");
  });

  it("covers every live placement once", () => {
    const used = AD_SLOT_USAGE.map((row) => row.placement);
    expect(new Set(used).size).toBe(used.length);
    for (const row of AD_SLOT_USAGE) {
      expect(AD_SLOTS[row.placement]).toBeTruthy();
    }
  });
});
