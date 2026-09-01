import type { MetadataRoute } from "next";
import { CALCULATOR_SEO, SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-09-01");
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
  ];
  for (const seo of Object.values(CALCULATOR_SEO)) {
    pages.push({
      url: `${SITE_URL}${seo.path}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: seo.path === "/longevity" ? 0.9 : 0.8,
    });
  }
  return pages;
}
