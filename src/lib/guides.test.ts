import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import {
  BABY_AFFORD_FAQS,
  BABY_AFFORD_GUIDE,
  BABY_SAVE_FAQS,
  BABY_SAVE_GUIDE,
  EXTRA_VS_SAVINGS_FAQS,
  EXTRA_VS_SAVINGS_GUIDE,
  GUIDE_PATHS,
  babyAffordArticleJsonLd,
  babyAffordBreadcrumbJsonLd,
  babyAffordFaqJsonLd,
  babySaveArticleJsonLd,
  babySaveBreadcrumbJsonLd,
  extraVsSavingsArticleJsonLd,
  extraVsSavingsBreadcrumbJsonLd,
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
    expect(BABY_SAVE_GUIDE.path).toBe("/guides/family/how-much-should-you-save-before-having-a-baby");
    expect(BABY_SAVE_GUIDE.h1).toBe("How Much Money Should You Have Saved Before Having a Baby?");
    expect(BABY_SAVE_GUIDE.title).toBe("How Much Should You Save Before Having a Baby? | Runaway Finance");
    expect(BABY_SAVE_GUIDE.primaryCalculator).toBe("/child");
    expect(EXTRA_VS_SAVINGS_GUIDE.path).toBe("/guides/home/should-i-pay-extra-on-my-mortgage-or-keep-savings");
    expect(EXTRA_VS_SAVINGS_GUIDE.themePath).toBe("/guides/home");
    expect(EXTRA_VS_SAVINGS_GUIDE.h1).toBe("Should I Pay Extra on My Mortgage or Keep the Money in Savings?");
    expect(EXTRA_VS_SAVINGS_GUIDE.primaryCalculator).toBe("/mortgage/payoff");
  });

  it("lists baby-savings FAQs once for visible FAQPage structured data", () => {
    expect(BABY_SAVE_FAQS).toHaveLength(8);
    const names = BABY_SAVE_FAQS.map((faq) => faq.question);
    expect(new Set(names).size).toBe(names.length);
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
    const saveArticle = babySaveArticleJsonLd();
    const saveCrumbs = babySaveBreadcrumbJsonLd();
    expect(saveArticle.url).toBe(`${SITE_URL}${BABY_SAVE_GUIDE.path}`);
    expect((saveCrumbs.itemListElement as { name: string }[]).map((item) => item.name)).toEqual([
      "Guides",
      "Family & Children",
      BABY_SAVE_GUIDE.h1,
    ]);
    expect(EXTRA_VS_SAVINGS_FAQS).toHaveLength(5);
    const extraArticle = extraVsSavingsArticleJsonLd();
    const extraCrumbs = extraVsSavingsBreadcrumbJsonLd();
    expect(extraArticle.url).toBe(`${SITE_URL}${EXTRA_VS_SAVINGS_GUIDE.path}`);
    expect((extraCrumbs.itemListElement as { name: string }[]).map((item) => item.name)).toEqual([
      "Guides",
      "Home & Mortgage",
      EXTRA_VS_SAVINGS_GUIDE.h1,
    ]);
  });

  it("adds the theme and article to the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);
    for (const path of GUIDE_PATHS) {
      expect(urls).toContain(`${SITE_URL}${path}`);
    }
  });
});
