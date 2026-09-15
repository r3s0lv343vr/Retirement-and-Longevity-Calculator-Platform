import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import {
  BABY_AFFORD_FAQS,
  BABY_AFFORD_GUIDE,
  GUIDE_PATHS,
  babyAffordArticleJsonLd,
  babyAffordBreadcrumbJsonLd,
  babyAffordFaqJsonLd,
} from "./guides";
import { SITE_URL } from "./seo";

describe("Family & Children guide catalog", () => {
  it("uses the upload slug, H1, title and description", () => {
    expect(BABY_AFFORD_GUIDE.path).toBe("/guides/family/can-i-afford-to-have-a-baby");
    expect(BABY_AFFORD_GUIDE.themePath).toBe("/guides/family");
    expect(BABY_AFFORD_GUIDE.h1).toBe("Can I Afford to Have a Baby?");
    expect(BABY_AFFORD_GUIDE.title).toBe(
      "Can I Afford to Have a Baby? A Financial Readiness Guide | Runaway Finance",
    );
    expect(BABY_AFFORD_GUIDE.description).toMatch(/childcare, parental leave/);
    expect(BABY_AFFORD_GUIDE.primaryCalculator).toBe("/child");
    expect(BABY_AFFORD_GUIDE.reviewed).toBe("September 2026");
  });

  it("lists every FAQ once for visible FAQPage structured data", () => {
    expect(BABY_AFFORD_FAQS).toHaveLength(7);
    const names = BABY_AFFORD_FAQS.map((faq) => faq.question);
    expect(new Set(names).size).toBe(names.length);
    const faq = babyAffordFaqJsonLd();
    expect(faq["@type"]).toBe("FAQPage");
    expect((faq.mainEntity as { name: string }[]).map((item) => item.name)).toEqual(names);
  });

  it("builds Article and breadcrumb JSON-LD for the production slug", () => {
    const article = babyAffordArticleJsonLd();
    const crumbs = babyAffordBreadcrumbJsonLd();
    expect(article["@type"]).toBe("Article");
    expect(article.headline).toBe(BABY_AFFORD_GUIDE.h1);
    expect(article.url).toBe(`${SITE_URL}${BABY_AFFORD_GUIDE.path}`);
    expect((article.author as { name: string }).name).toBe("Runaway Finance");
    expect((crumbs.itemListElement as { name: string }[]).map((item) => item.name)).toEqual([
      "Guides",
      "Family & Children",
      BABY_AFFORD_GUIDE.h1,
    ]);
  });

  it("adds the theme and article to the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);
    for (const path of GUIDE_PATHS) {
      expect(urls).toContain(`${SITE_URL}${path}`);
    }
  });
});
