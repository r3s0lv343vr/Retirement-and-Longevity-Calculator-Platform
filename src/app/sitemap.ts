import type { MetadataRoute } from "next";
import { GUIDE_PATHS } from "@/lib/guides";
import { JOURNEY_PATHS } from "@/lib/journeys";
import { CALCULATOR_SEO, SITE_URL } from "@/lib/seo";
import { TRUST_PAGES } from "@/lib/trust";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-09-02");
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
  ];
  for (const path of JOURNEY_PATHS) {
    pages.push({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }
  for (const path of GUIDE_PATHS) {
    pages.push({
      url: `${SITE_URL}${path}`,
      lastModified: new Date("2026-09-15"),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }
  for (const seo of Object.values(CALCULATOR_SEO)) {
    pages.push({
      url: `${SITE_URL}${seo.path}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: seo.path === "/longevity" ? 0.9 : 0.8,
    });
  }
  for (const page of Object.values(TRUST_PAGES)) {
    pages.push({
      url: `${SITE_URL}${page.path}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    });
  }
  return pages;
}
