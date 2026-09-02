import type { Metadata } from "next";
import { BUILDER_NAME, CONTACT_EMAIL, HUB_TITLE } from "./brand";
import { SITE_URL } from "./seo";

export const TRUST_PATHS = ["/about", "/contact", "/privacy", "/disclaimer"] as const;
export type TrustPath = (typeof TRUST_PATHS)[number];

export const TRUST_PAGES: Record<
  TrustPath,
  { path: TrustPath; name: string; title: string; description: string }
> = {
  "/about": {
    path: "/about",
    name: "About",
    title: `About ${HUB_TITLE} – Why these calculators exist`,
    description: `${HUB_TITLE} is a free cluster of educational calculators built by ${BUILDER_NAME}. Year-by-year tools for retirement, family costs, and whether a savings goal survives.`,
  },
  "/contact": {
    path: "/contact",
    name: "Contact",
    title: `Contact ${HUB_TITLE}`,
    description: `Contact ${BUILDER_NAME} about ${HUB_TITLE} at ${CONTACT_EMAIL}. Site questions only. This is not financial advice.`,
  },
  "/privacy": {
    path: "/privacy",
    name: "Privacy",
    title: `Privacy – ${HUB_TITLE}`,
    description: `${HUB_TITLE} does not store your savings or plan numbers. This page explains the visitor cookie, admin counts, and advertising cookies if AdSense is on.`,
  },
  "/disclaimer": {
    path: "/disclaimer",
    name: "Disclaimer",
    title: `Disclaimer – ${HUB_TITLE}`,
    description: `${HUB_TITLE} is an educational projection. It is not tax, investment, or medical advice and it does not replace a Certified Financial Planner.`,
  },
};

export function trustMetadata(path: TrustPath): Metadata {
  const page = TRUST_PAGES[path];
  const url = `${SITE_URL}${path}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: url },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      type: "website",
      siteName: HUB_TITLE,
    },
  };
}

export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BUILDER_NAME,
    email: CONTACT_EMAIL,
    url: SITE_URL,
    description: `${BUILDER_NAME} builds ${HUB_TITLE}.`,
  };
}
