import { HUB_NAME, HUB_TITLE } from "./brand";
import { SITE_URL } from "./seo";

export const FAMILY_GUIDE_THEME_PATH = "/guides/family" as const;
export const BABY_AFFORD_PATH = "/guides/family/can-i-afford-to-have-a-baby" as const;

export type GuideThemePath = typeof FAMILY_GUIDE_THEME_PATH;
export type GuideArticlePath = typeof BABY_AFFORD_PATH;
export type GuidePath = GuideThemePath | GuideArticlePath;

export type GuideFaq = { question: string; answer: string };

export const BABY_AFFORD_FAQS: GuideFaq[] = [
  {
    question: "How much money should I save before having a baby?",
    answer:
      "There is no universal amount. Separate known setup costs, the expected parental-leave income gap, emergency reserves and longer-term child funding rather than relying on one national savings target.",
  },
  {
    question: "How much does a baby cost per month?",
    answer:
      "It varies substantially by childcare, healthcare, feeding, location and household choices. Build the estimate from expenses you are actually likely to face and then stress-test it.",
  },
  {
    question: "Is childcare usually the biggest cost?",
    answer:
      "For many households using paid care, it can be one of the largest recurring expenses. Families using unpaid care or different work arrangements can have a very different cost structure.",
  },
  {
    question: "Does the United States guarantee paid parental leave?",
    answer:
      "No single federal rule guarantees paid parental leave to all private-sector workers. Eligible workers may have job-protected unpaid leave under FMLA, while paid leave can depend on employer benefits, state programs and other eligibility rules.",
  },
  {
    question: "Do I need to own a house before having a baby?",
    answer:
      "No. Renting versus owning is a separate decision. What matters here is whether current housing works for the household and whether a future move would materially change the budget.",
  },
  {
    question: "Should college be included?",
    answer:
      "It can be included as a future goal, but it is clearer to model it separately from immediate and childhood expenses because the funding timeline is very different.",
  },
  {
    question: "What if I cannot predict the costs accurately?",
    answer:
      "Use a reasonable base case and then run higher-cost and lower-income scenarios. Sensitivity testing is more useful than pretending one forecast will be exact.",
  },
];

export const BABY_AFFORD_GUIDE = {
  path: BABY_AFFORD_PATH,
  themePath: FAMILY_GUIDE_THEME_PATH,
  h1: "Can I Afford to Have a Baby?",
  title: "Can I Afford to Have a Baby? A Financial Readiness Guide | Runaway Finance",
  description:
    "Can you afford a baby? Test childcare, parental leave, recurring costs, housing, savings and future goals before you decide.",
  reviewed: "September 2026",
  datePublished: "2026-09-15",
  dateModified: "2026-09-15",
  primaryCalculator: "/child" as const,
  faqs: BABY_AFFORD_FAQS,
};

export const GUIDE_THEMES = [
  {
    path: FAMILY_GUIDE_THEME_PATH,
    title: "Family & Children",
    question: "What will a baby or a child do to household finances?",
    description:
      "Guides on baby affordability, childcare, parental leave and the longer child-cost path. Use them with the Growing a Family calculators.",
    articles: [BABY_AFFORD_GUIDE],
  },
] as const;

export const GUIDE_ARTICLES = [BABY_AFFORD_GUIDE] as const;

export const GUIDE_PATHS = [FAMILY_GUIDE_THEME_PATH, BABY_AFFORD_PATH] as const;

export function guideThemeByPath(path: string) {
  return GUIDE_THEMES.find((theme) => theme.path === path);
}

export function guideArticleByPath(path: string) {
  return GUIDE_ARTICLES.find((article) => article.path === path);
}

export function isGuidePath(path: string): path is GuidePath {
  return (GUIDE_PATHS as readonly string[]).includes(path);
}

export function familyGuideThemeMetadataUrl() {
  return `${SITE_URL}${FAMILY_GUIDE_THEME_PATH}`;
}

export function babyAffordCanonicalUrl() {
  return `${SITE_URL}${BABY_AFFORD_PATH}`;
}

export function familyGuideBreadcrumbJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Guides", item: `${SITE_URL}/guides` },
      { "@type": "ListItem", position: 2, name: "Family & Children", item: familyGuideThemeMetadataUrl() },
    ],
  };
}

export function babyAffordBreadcrumbJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Guides", item: `${SITE_URL}/guides` },
      { "@type": "ListItem", position: 2, name: "Family & Children", item: familyGuideThemeMetadataUrl() },
      { "@type": "ListItem", position: 3, name: BABY_AFFORD_GUIDE.h1, item: babyAffordCanonicalUrl() },
    ],
  };
}

export function babyAffordArticleJsonLd(): Record<string, unknown> {
  const url = babyAffordCanonicalUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: BABY_AFFORD_GUIDE.h1,
    description: BABY_AFFORD_GUIDE.description,
    datePublished: BABY_AFFORD_GUIDE.datePublished,
    dateModified: BABY_AFFORD_GUIDE.dateModified,
    author: { "@type": "Organization", name: HUB_NAME },
    publisher: { "@type": "Organization", name: HUB_TITLE },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };
}

export function babyAffordFaqJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: BABY_AFFORD_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
