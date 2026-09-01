import type { Metadata } from "next";
import { HUB_BLURB, HUB_NAME, HUB_TITLE } from "./brand";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://retirement-and-longevity-calculator.vercel.app";

export const SEO_POSITIONING = "Plan the decision, not just the number.";
export const SEO_TRUST =
  "Free to use · No account required · Assumptions shown · Educational planning tools";
export const SEO_REVIEWED = "September 2026";

export const HUB_SEO_TITLE = `${HUB_NAME} | Financial Planning Calculators for Retirement, Savings & Life`;
export const HUB_SEO_DESCRIPTION =
  "Free financial planning calculators for retirement, savings, Social Security, family costs and major life goals. Test your numbers and explore how financial decisions may affect your future.";

export type CalculatorPath = "/longevity" | "/need" | "/when" | "/claim" | "/housing" | "/child" | "/goal";

export type CalculatorSeo = {
  path: CalculatorPath;
  /** Visible product name. Do not change. */
  name: string;
  title: string;
  description: string;
  question: string;
  eyebrow: string;
  seoCall: string;
  howItWorks: string;
  limitations: string;
  related: { href: CalculatorPath; label: string }[];
};

export const CALCULATOR_SEO: Record<CalculatorPath, CalculatorSeo> = {
  "/longevity": {
    path: "/longevity",
    name: "How Long Before I Go Broke Calculator",
    question: "Given what I have, how far does the money go?",
    title: "Retirement Longevity Calculator – How Long Will My Money Last?",
    description:
      "See how long your retirement savings could last. Project year by year with Social Security, pensions, healthcare inflation, part-time work, and later-life costs.",
    eyebrow: "Retirement longevity calculator",
    seoCall:
      "See how long your retirement money could last. Project your savings year by year while accounting for retirement income, Social Security, pensions, healthcare inflation, part-time work, lifestyle changes and later-life costs.",
    howItWorks:
      "The outlook grows lifestyle at ordinary inflation and healthcare at a higher medical rate, then steps through go-go, slow-go and no-go years. Part-time work, housing, and two-person survivor rules apply only if you enter them. A straight-line compare sits beside the same plan.",
    limitations:
      "Educational projection only. It is not a forecast of markets, taxes, or health. Compare this outlook with a licensed advisor before making decisions.",
    related: [
      { href: "/need", label: "Calculate the nest egg you need" },
      { href: "/when", label: "Calculate when you can stop working" },
      { href: "/claim", label: "Compare Social Security at 67 vs 70" },
    ],
  },
  "/need": {
    path: "/need",
    name: "How Much Do I Need to Last",
    question: "How much nest egg today funds this plan through a given age?",
    title: "How Much Do I Need to Retire? Retirement Savings Calculator",
    description:
      "Estimate the retirement nest egg you may need today so your entered spending, healthcare, Social Security and pension last through the age you choose.",
    eyebrow: "Retirement savings calculator",
    seoCall:
      "Estimate the retirement savings you may need. Enter your planned retirement age, spending, healthcare costs, Social Security, pension income and assumptions to estimate the nest egg needed to fund your plan through the age you choose.",
    howItWorks:
      "This is the inverse of How long before I go broke. It uses the spending and income you enter — not the comfortable-living floors — and solves for the savings on hand today that still last through your plan-through age.",
    limitations:
      "Educational projection only. Housing, care, and side-hustle are included only if you put them on a later tool. It is not tax or investment advice.",
    related: [
      { href: "/longevity", label: "See how long today's savings last" },
      { href: "/when", label: "Find the earliest age you can stop working" },
    ],
  },
  "/when": {
    path: "/when",
    name: "When Can I Stop Working",
    question: "Given what I have, how soon can full-time work end?",
    title: "When Can I Retire? Retirement Age Calculator",
    description:
      "Find the earliest age your numbers may let you stop full-time work. Uses your savings, yearly adding, spending, healthcare and retirement income.",
    eyebrow: "Retirement age calculator",
    seoCall:
      "Find the earliest age your numbers may let you stop working full-time. Enter your savings, annual contributions, expected spending, healthcare costs and retirement income. The calculator tests when your financial plan may support leaving full-time work.",
    howItWorks:
      "How long asks how far today's savings go. How much asks how large the nest egg must be. This tool keeps the savings you entered and searches for the earliest work-end that still lasts through the age you set.",
    limitations:
      "Educational projection only. It does not model taxes, job-market risk, or guaranteed employment until the solved age.",
    related: [
      { href: "/longevity", label: "See how long the same plan lasts" },
      { href: "/need", label: "Calculate the nest egg you need instead" },
    ],
  },
  "/claim": {
    path: "/claim",
    name: "Claim Social Security at 67 vs 70",
    question: "Does delaying the check from 67 to 70 make the plan last longer?",
    title: "Social Security 67 vs 70 Calculator – Should I Wait?",
    description:
      "Compare claiming Social Security at 67 versus waiting until 70. See how the delay changes yearly income and how long retirement savings may last.",
    eyebrow: "Social Security claiming calculator",
    seoCall:
      "See whether waiting until 70 could make your retirement plan last longer. Compare claiming Social Security at 67 versus delaying until 70 and see how the decision changes later income and the longevity of your savings.",
    howItWorks:
      "This compare scales the check the way U.S. delayed retirement credits work: the model treats 67 as full retirement age and age 70 as 24% higher, then runs the same spending path with fewer years of checks. Your actual full retirement age depends on birth year.",
    limitations:
      "Educational projection only. It is not a Social Security Administration estimate. Benefits, taxes, and earnings tests can differ from this model.",
    related: [
      { href: "/longevity", label: "Put the same compare on the full outlook" },
      { href: "/housing", label: "Compare later-life housing paths" },
    ],
  },
  "/housing": {
    path: "/housing",
    name: "Stay Home vs CCRC vs Nursing",
    question: "Which later-life housing path lasts farther?",
    title: "Senior Living Cost Calculator – Home vs CCRC vs Nursing Home",
    description:
      "Compare staying home, a continuing-care retirement community, or nursing care. See how each later-life housing path changes long-term costs and savings.",
    eyebrow: "Later-life housing calculator",
    seoCall:
      "Compare how different later-life housing choices could affect your money. Test staying at home, moving into a continuing care retirement community, or entering nursing care and see how each path changes long-term retirement costs and how long savings last.",
    howItWorks:
      "Three exclusive runs share the same savings and spending. This page does not add housing cells to How long. Each path is a separate plan: stay home, CCRC, or nursing.",
    limitations:
      "Educational projection only. Facility fees, care needs, and health can move far from any entered rent.",
    related: [
      { href: "/longevity", label: "See housing on the full year-by-year outlook" },
      { href: "/claim", label: "Compare Social Security at 67 vs 70" },
    ],
  },
  "/child": {
    path: "/child",
    name: "Nest Eggs for a Child",
    question: "When am I ready for a baby, and what nest eggs raise them through 18 and university?",
    title: "Baby & Child Cost Calculator – Can I Afford to Have a Baby?",
    description:
      "See what raising a child could cost through 18 and university. Estimate living, school and education inflation, then the yearly add that keeps each nest egg off salary.",
    eyebrow: "Baby and child cost calculator",
    seoCall:
      "See what having a child could mean for your finances. Estimate how much you may need to raise a child through age 18, account for growing living and education costs, plan for university, and calculate how much you may need to save each year.",
    howItWorks:
      "Year-one living is monthly cost × 12. That stream grows with ordinary inflation and an age-related increase. School, extras, and university use a separate education inflation rate. Two pots: through 18, then university. The outlook says when you are ready and whether school would sit on salary.",
    limitations:
      "Educational projection only. It is not a tax, 529, or college-aid estimate. Actual child costs vary widely.",
    related: [{ href: "/goal", label: "See if competing expenses raid a savings goal" }],
  },
  "/goal": {
    path: "/goal",
    name: "Will the Goal Survive",
    question: "Do competing expenses force a dip that dissolves the savings for this goal?",
    title: "Savings Goal Calculator – Will Expenses Derail My Goal?",
    description:
      "Find out whether everyday expenses could force a dip into money you set aside for a goal. Emergency and other savings are raided first; the earmarked pot is last.",
    eyebrow: "Savings goal calculator",
    seoCall:
      "Find out whether everyday expenses could force you to dip into the money you're saving for something important. Set your savings goal, current savings, contributions and competing expenses. See whether your plan stays on track — or when other costs could begin eating into the money you've set aside.",
    howItWorks:
      "Any goal. Emergency and other savings are dipped first. The earmarked pot is last. If expenses keep overflowing, that pot can be compromised or dissolved so the goal is never reached.",
    limitations:
      "Educational projection only. It does not model credit, taxes, or emergency-fund rules beyond the amounts you enter.",
    related: [{ href: "/child", label: "Plan nest eggs for raising a child" }],
  },
};

export const HUB_CLUSTERS: { id: string; title: string; note: string; paths: CalculatorPath[] }[] = [
  {
    id: "retirement",
    title: "Retirement planning",
    note: "The flagship cluster. How long money lasts, how much you need, and when work can end.",
    paths: ["/longevity", "/need", "/when"],
  },
  {
    id: "later-life",
    title: "Social Security and later life",
    note: "Claiming age and later-life housing as their own questions.",
    paths: ["/claim", "/housing"],
  },
  {
    id: "family",
    title: "Family and life planning",
    note: "Readiness for a baby, then two nest eggs through 18 and university.",
    paths: ["/child"],
  },
  {
    id: "goals",
    title: "Savings and financial goals",
    note: "Whether everyday expenses dissolve the pot you marked for one goal.",
    paths: ["/goal"],
  },
];

export function calculatorMetadata(path: CalculatorPath): Metadata {
  const seo = CALCULATOR_SEO[path];
  const url = `${SITE_URL}${path}`;
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: url },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      type: "website",
      siteName: HUB_TITLE,
    },
  };
}

export function hubMetadata(): Metadata {
  return {
    title: { absolute: HUB_SEO_TITLE },
    description: HUB_SEO_DESCRIPTION,
    alternates: { canonical: SITE_URL },
    openGraph: {
      title: HUB_SEO_TITLE,
      description: HUB_SEO_DESCRIPTION,
      url: SITE_URL,
      type: "website",
      siteName: HUB_TITLE,
    },
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: HUB_TITLE,
    description: HUB_BLURB,
    url: SITE_URL,
  };
}

export function breadcrumbJsonLd(path: CalculatorPath): Record<string, unknown> {
  const seo = CALCULATOR_SEO[path];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: HUB_TITLE, item: SITE_URL },
      { "@type": "ListItem", position: 2, name: seo.name, item: `${SITE_URL}${path}` },
    ],
  };
}

export function webPageJsonLd(path: CalculatorPath): Record<string, unknown> {
  const seo = CALCULATOR_SEO[path];
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: seo.name,
    headline: seo.title,
    description: seo.description,
    url: `${SITE_URL}${path}`,
    isPartOf: { "@type": "WebSite", name: HUB_TITLE, url: SITE_URL },
    dateModified: "2026-09-01",
  };
}
