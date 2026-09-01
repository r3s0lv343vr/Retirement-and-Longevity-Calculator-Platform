import { describe, expect, it } from "vitest";
import { CALCULATOR_SEO, HUB_CLUSTERS, HUB_SEO_TITLE, SITE_URL } from "./seo";

describe("calculator SEO catalog", () => {
  it("keeps the seven product names", () => {
    expect(CALCULATOR_SEO["/longevity"].name).toBe("How Long Before I Go Broke Calculator");
    expect(CALCULATOR_SEO["/need"].name).toBe("How Much Do I Need to Last");
    expect(CALCULATOR_SEO["/when"].name).toBe("When Can I Stop Working");
    expect(CALCULATOR_SEO["/claim"].name).toBe("Claim Social Security at 67 vs 70");
    expect(CALCULATOR_SEO["/housing"].name).toBe("Stay Home vs CCRC vs Nursing");
    expect(CALCULATOR_SEO["/child"].name).toBe("Nest Eggs for a Child");
    expect(CALCULATOR_SEO["/goal"].name).toBe("Will the Goal Survive");
  });

  it("gives each calculator a unique title and description", () => {
    const entries = Object.values(CALCULATOR_SEO);
    const titles = entries.map((seo) => seo.title);
    const descriptions = entries.map((seo) => seo.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    expect(titles.every((title) => title.length > 20 && title.length < 70)).toBe(true);
    expect(descriptions.every((d) => d.length > 80 && d.length < 170)).toBe(true);
  });

  it("covers every calculator in a hub cluster", () => {
    const clustered = HUB_CLUSTERS.flatMap((cluster) => cluster.paths);
    expect(clustered.sort()).toEqual(Object.keys(CALCULATOR_SEO).sort());
  });

  it("points the sitemap at the public site", () => {
    expect(SITE_URL).toMatch(/^https:\/\//);
    expect(HUB_SEO_TITLE).toContain("Financial Planning Calculators");
  });
});
