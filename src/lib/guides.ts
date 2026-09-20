import { HUB_NAME, HUB_TITLE } from "./brand";
import { SITE_URL } from "./seo";

export const FAMILY_GUIDE_THEME_PATH = "/guides/family" as const;
export const HOME_GUIDE_THEME_PATH = "/guides/home" as const;
export const BABY_AFFORD_PATH = "/guides/family/can-i-afford-to-have-a-baby" as const;
export const BABY_SAVE_PATH = "/guides/family/how-much-should-you-save-before-having-a-baby" as const;
export const EXTRA_VS_SAVINGS_PATH =
  "/guides/home/should-i-pay-extra-on-my-mortgage-or-keep-savings" as const;
export const TRUE_COST_PATH = "/guides/home/mortgage-payment-vs-true-cost-of-owning-a-home" as const;

export type GuideThemePath = typeof FAMILY_GUIDE_THEME_PATH | typeof HOME_GUIDE_THEME_PATH;
export type GuideArticlePath =
  | typeof BABY_AFFORD_PATH
  | typeof BABY_SAVE_PATH
  | typeof EXTRA_VS_SAVINGS_PATH
  | typeof TRUE_COST_PATH;
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

export const BABY_SAVE_FAQS: GuideFaq[] = [
  {
    question: "Do I need the entire cost of raising a child saved before having a baby?",
    answer:
      "No. Nest Eggs for a Child solves for the starting balance that, with the yearly add you enter, can pay each raising year without the pot going negative. Future years can still be funded by later saving and return. That is not the same as having every future dollar in cash today.",
  },
  {
    question: "Is $20,000 enough to have a baby?",
    answer:
      "The savings balance alone cannot answer that. In the calculator it depends on Child cost / month, school and extras, the two yearly adds, inflation, the age-related increase, education inflation, return, and years until the baby. Paid leave and setup costs sit outside those nest eggs as cash you may need soon.",
  },
  {
    question: "Should my emergency fund count as baby savings?",
    answer:
      "Avoid counting the same dollars twice. The raising and university pots are earmarked. An emergency reserve is for unexpected shocks, not the planned child-cost stream.",
  },
  {
    question: "Should childcare be included?",
    answer:
      "Yes when you expect to pay for it. Enter it in Child cost / month. The calculator grows that living stream through the year before university. It does not take a childcare stop date, so a few years of care entered as a permanent monthly cost will overstate later years.",
  },
  {
    question: "How should parental leave be calculated?",
    answer:
      "Estimate the difference between normal take-home income and expected take-home income during leave, and multiply by the months affected. Hold that as a near-term cash reserve. Nest Eggs for a Child does not have a parental-leave input.",
  },
  {
    question: "Should college be included?",
    answer:
      "Yes as a separate university nest egg. The calculator funds each university year, inflated at education inflation, from a second pot. It is not one inflated lump discounted once at age 18.",
  },
  {
    question: "What investment return should I assume?",
    answer:
      "No return is guaranteed. Use the Return on these pots field and test a lower-return case. The nest egg is the starting balance that survives the year-by-year path at the rate you enter.",
  },
  {
    question: "What inflation rate should I use?",
    answer:
      "Living costs use Inflation and a separate Age-related increase. School, co-curricular extras, and university use Education inflation. No rate is guaranteed for 18 years, so change them and compare.",
  },
];

export const BABY_SAVE_GUIDE = {
  path: BABY_SAVE_PATH,
  themePath: FAMILY_GUIDE_THEME_PATH,
  h1: "How Much Money Should You Have Saved Before Having a Baby?",
  title: "How Much Should You Save Before Having a Baby? | Runaway Finance",
  description:
    "Learn how to estimate baby savings using the Nest Eggs for a Child calculator: living costs, inflation, age-related increase, yearly adds, and a separate university nest egg.",
  reviewed: "September 2026",
  datePublished: "2026-09-16",
  dateModified: "2026-09-16",
  primaryCalculator: "/child" as const,
  faqs: BABY_SAVE_FAQS,
};

export const EXTRA_VS_SAVINGS_FAQS: GuideFaq[] = [
  {
    question: "Is paying extra on my mortgage equivalent to earning my mortgage rate?",
    answer:
      "It is a useful starting approximation because reducing principal avoids future interest, but timing, taxes, loan terms and the loss of liquidity can change the full economic comparison. Mortgage Payoff shows the interest avoided and time reclaimed; it does not treat prepayment as an investment return.",
  },
  {
    question: "Should I drain savings to pay down the mortgage?",
    answer:
      "A rate comparison alone is not enough. If draining savings would leave you unable to absorb income loss or a large expense, you may simply replace relatively inexpensive mortgage debt with more expensive borrowing later.",
  },
  {
    question: "What if my savings rate is lower than my mortgage rate?",
    answer:
      "That strengthens the mathematical case for prepayment, but liquidity still has value. First ask why the cash is being held and whether the remaining reserve is sufficient.",
  },
  {
    question: "What if I expect investments to earn more than my mortgage rate?",
    answer:
      "Expected investment returns are uncertain. Compare after-tax expected return, volatility, time horizon and liquidity with the relatively predictable interest avoided by mortgage prepayment.",
  },
  {
    question: "Can I save and prepay at the same time?",
    answer:
      "Yes. A split strategy can be especially useful while building an emergency fund or preparing for a known family expense.",
  },
];

export const EXTRA_VS_SAVINGS_GUIDE = {
  path: EXTRA_VS_SAVINGS_PATH,
  themePath: HOME_GUIDE_THEME_PATH,
  h1: "Should I Pay Extra on My Mortgage or Keep the Money in Savings?",
  title: "Pay Extra on Mortgage or Save? How to Decide | Runaway Finance",
  description:
    "Should extra cash go to your mortgage or savings? Compare your mortgage rate, emergency fund, liquidity, investment opportunity, job stability and near-term family costs.",
  reviewed: "September 2026",
  datePublished: "2026-09-20",
  dateModified: "2026-09-20",
  primaryCalculator: "/mortgage/payoff" as const,
  faqs: EXTRA_VS_SAVINGS_FAQS,
};

export const TRUE_COST_FAQS: GuideFaq[] = [
  {
    question: "Is the mortgage payment the true cost of owning a home?",
    answer:
      "No. The lender quote is usually principal and interest. Can I Get a Mortgage treats estimated housing cost as P&I plus tax, insurance, PMI, HOA, and upkeep. Closing, moving, and repairs or furnishing sit in cash to buy.",
  },
  {
    question: "Does the calculator include utilities?",
    answer:
      "No. Electric, gas, water, trash, and internet are not a housing-cost field. They are not inside estimated housing cost. Fold a stand-in into the life-cost fields, or raise upkeep, if you want them in the outlook.",
  },
  {
    question: "What is cash to buy?",
    answer:
      "Cash to buy is down payment plus closing costs plus moving plus repairs or furnishing. It is the check you write to get the keys, not the monthly payment.",
  },
  {
    question: "When does PMI stop?",
    answer:
      "The calculator turns PMI off the month loan-to-value hits 80% of the purchase price — not a later appraisal. Extra principal can bring that month forward. The scheduled payment is not recast.",
  },
  {
    question: "Is Can I Get a Mortgage a lender quote?",
    answer:
      "No. It is an educational projection, not a pre-approval, a rate lock, or tax advice. Lenders use their own rules.",
  },
];

export const TRUE_COST_GUIDE = {
  path: TRUE_COST_PATH,
  themePath: HOME_GUIDE_THEME_PATH,
  h1: "Mortgage Payment vs. the True Cost of Owning a Home",
  title: "Mortgage Payment vs. the True Cost of Owning a Home | Runaway Finance",
  description:
    "The lender quote is P&I. Housing cost adds tax, insurance, PMI, HOA, and upkeep. Cash to buy sits before the first payment. Run it in Can I Get a Mortgage.",
  reviewed: "September 2026",
  datePublished: "2026-09-20",
  dateModified: "2026-09-20",
  primaryCalculator: "/mortgage" as const,
  faqs: TRUE_COST_FAQS,
};

export const GUIDE_THEMES = [
  {
    path: FAMILY_GUIDE_THEME_PATH,
    title: "Family & Children",
    question: "What will a baby or a child do to household finances?",
    description:
      "Guides on baby affordability, how much to save before a child, and the nest-egg path through 18 and university. Use them with the Growing a Family calculators.",
    articles: [BABY_AFFORD_GUIDE, BABY_SAVE_GUIDE],
  },
  {
    path: HOME_GUIDE_THEME_PATH,
    title: "Home & Mortgage",
    question: "What will the house really cost — and should extra cash go to the loan?",
    description:
      "Guides on the true cost of owning a house, extra payments versus savings, and the payoff path. Use them with the Buying a Home calculators.",
    articles: [TRUE_COST_GUIDE, EXTRA_VS_SAVINGS_GUIDE],
  },
] as const;

export const GUIDE_ARTICLES = [BABY_AFFORD_GUIDE, BABY_SAVE_GUIDE, TRUE_COST_GUIDE, EXTRA_VS_SAVINGS_GUIDE] as const;

export const GUIDE_PATHS = [
  FAMILY_GUIDE_THEME_PATH,
  BABY_AFFORD_PATH,
  BABY_SAVE_PATH,
  HOME_GUIDE_THEME_PATH,
  TRUE_COST_PATH,
  EXTRA_VS_SAVINGS_PATH,
] as const;

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

export function homeGuideThemeMetadataUrl() {
  return `${SITE_URL}${HOME_GUIDE_THEME_PATH}`;
}

export function extraVsSavingsCanonicalUrl() {
  return `${SITE_URL}${EXTRA_VS_SAVINGS_PATH}`;
}

export function trueCostCanonicalUrl() {
  return `${SITE_URL}${TRUE_COST_PATH}`;
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
  return guideFaqJsonLd(BABY_AFFORD_FAQS);
}

export function babySaveCanonicalUrl() {
  return `${SITE_URL}${BABY_SAVE_PATH}`;
}

export function guideFaqJsonLd(faqs: GuideFaq[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function guideArticleJsonLd(article: {
  path: string;
  h1: string;
  description: string;
  datePublished: string;
  dateModified: string;
}): Record<string, unknown> {
  const url = `${SITE_URL}${article.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.h1,
    description: article.description,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: { "@type": "Organization", name: HUB_NAME },
    publisher: { "@type": "Organization", name: HUB_TITLE },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };
}

export function guideArticleBreadcrumbJsonLd(article: {
  path: string;
  h1: string;
  themePath: string;
}): Record<string, unknown> {
  const theme = GUIDE_THEMES.find((item) => item.path === article.themePath);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Guides", item: `${SITE_URL}/guides` },
      {
        "@type": "ListItem",
        position: 2,
        name: theme?.title ?? "Guides",
        item: `${SITE_URL}${article.themePath}`,
      },
      { "@type": "ListItem", position: 3, name: article.h1, item: `${SITE_URL}${article.path}` },
    ],
  };
}

export function babySaveArticleJsonLd(): Record<string, unknown> {
  return guideArticleJsonLd(BABY_SAVE_GUIDE);
}

export function babySaveBreadcrumbJsonLd(): Record<string, unknown> {
  return guideArticleBreadcrumbJsonLd(BABY_SAVE_GUIDE);
}

export function babySaveFaqJsonLd(): Record<string, unknown> {
  return guideFaqJsonLd(BABY_SAVE_FAQS);
}

export function homeGuideBreadcrumbJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Guides", item: `${SITE_URL}/guides` },
      { "@type": "ListItem", position: 2, name: "Home & Mortgage", item: homeGuideThemeMetadataUrl() },
    ],
  };
}

export function extraVsSavingsArticleJsonLd(): Record<string, unknown> {
  return guideArticleJsonLd(EXTRA_VS_SAVINGS_GUIDE);
}

export function extraVsSavingsBreadcrumbJsonLd(): Record<string, unknown> {
  return guideArticleBreadcrumbJsonLd(EXTRA_VS_SAVINGS_GUIDE);
}

export function extraVsSavingsFaqJsonLd(): Record<string, unknown> {
  return guideFaqJsonLd(EXTRA_VS_SAVINGS_FAQS);
}

export function trueCostArticleJsonLd(): Record<string, unknown> {
  return guideArticleJsonLd(TRUE_COST_GUIDE);
}

export function trueCostBreadcrumbJsonLd(): Record<string, unknown> {
  return guideArticleBreadcrumbJsonLd(TRUE_COST_GUIDE);
}

export function trueCostFaqJsonLd(): Record<string, unknown> {
  return guideFaqJsonLd(TRUE_COST_FAQS);
}
