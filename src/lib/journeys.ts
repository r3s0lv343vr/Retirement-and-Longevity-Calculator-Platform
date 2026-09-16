import type { GuidePath } from "./guides";
import type { CalculatorPath } from "./seo";

export const JOURNEY_PATHS = ["/family", "/home", "/savings", "/retirement", "/guides"] as const;
export type JourneyPath = (typeof JOURNEY_PATHS)[number];

export type JourneyId = "family" | "home" | "savings" | "retirement";

export type Journey = {
  id: JourneyId;
  path: JourneyPath;
  nav: string;
  title: string;
  question: string;
  intro: string;
  calculators: CalculatorPath[];
  also: { href: CalculatorPath | JourneyPath | GuidePath | "/about"; label: string }[];
};

/** Unique homepage / admin assignment. Housing lives in Retirement; Home still cross-links it. */
export const JOURNEYS: Journey[] = [
  {
    id: "family",
    path: "/family",
    nav: "Family",
    title: "Growing a Family",
    question: "What will having a child do to our finances?",
    intro:
      "Family costs show up as living, school, and later education — often before the rest of the household plan is settled. This journey is about whether you are ready, and what nest eggs raise a child through 18 and university.",
    calculators: ["/child"],
    also: [
      { href: "/guides/family/can-i-afford-to-have-a-baby", label: "Read: Can I Afford to Have a Baby?" },
      {
        href: "/guides/family/how-much-should-you-save-before-having-a-baby",
        label: "Read: How Much Should You Save Before Having a Baby?",
      },
      { href: "/home", label: "See what a house payment would do beside a growing family" },
      { href: "/savings", label: "Check whether other goals survive the extra costs" },
    ],
  },
  {
    id: "home",
    path: "/home",
    nav: "Home",
    title: "Buying a Home",
    question: "What will the house really cost us — and can we afford it?",
    intro:
      "A mortgage payment is not the cost of the house. Tax, insurance, upkeep, and the rest of life sit beside it. If you already have the loan, extra payments can change how soon it is gone.",
    calculators: ["/mortgage", "/mortgage/payoff"],
    also: [
      { href: "/housing", label: "Compare later-life housing paths: stay home, CCRC, or nursing" },
      { href: "/family", label: "See child costs beside a house payment" },
      { href: "/savings", label: "See whether a house payment raids a savings goal" },
      { href: "/retirement", label: "Put housing in the later-life plan" },
    ],
  },
  {
    id: "savings",
    path: "/savings",
    nav: "Savings",
    title: "Building Savings",
    question: "Can I reach this goal without undermining everything else?",
    intro:
      "A named goal only survives if competing expenses do not empty the pot you marked for it. Emergency and other savings are raided first; the earmarked money is last.",
    calculators: ["/goal"],
    also: [
      { href: "/home", label: "See whether a house payment still leaves room to save" },
      { href: "/family", label: "Plan nest eggs for raising a child" },
      { href: "/retirement", label: "Check whether retirement savings last" },
    ],
  },
  {
    id: "retirement",
    path: "/retirement",
    nav: "Retirement",
    title: "Planning Retirement",
    question: "When can I retire, how much do I need, and how long will my money last?",
    intro:
      "Retirement stays a major pillar. These tools step year by year: how long today’s savings last, how large the nest egg must be, how soon full-time work can end, whether claiming Social Security at 67 vs 70 helps, and which later-life housing path lasts farther.",
    calculators: ["/longevity", "/need", "/when", "/claim", "/housing"],
    also: [
      { href: "/home", label: "See the house payment on its own path" },
      { href: "/savings", label: "See whether a named goal survives along the way" },
    ],
  },
];

export function journeyByPath(path: JourneyPath): Journey | undefined {
  return JOURNEYS.find((journey) => journey.path === path);
}

export function journeyForCalculator(path: CalculatorPath): Journey {
  if (path === "/child") return JOURNEYS[0]!;
  if (path === "/mortgage" || path === "/mortgage/payoff") return JOURNEYS[1]!;
  if (path === "/goal") return JOURNEYS[2]!;
  return JOURNEYS[3]!;
}

export const NAV_LINKS = [
  { href: "/", label: "Calculators" },
  { href: "/family", label: "Family" },
  { href: "/home", label: "Home" },
  { href: "/savings", label: "Savings" },
  { href: "/retirement", label: "Retirement" },
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "About" },
] as const;

export type NavHref = (typeof NAV_LINKS)[number]["href"];

export function navHrefForCurrent(current: string): NavHref {
  if (current === "/about" || current === "/contact" || current === "/privacy" || current === "/disclaimer") {
    return "/about";
  }
  if (current === "/guides" || current.startsWith("/guides/")) return "/guides";
  if (current === "/family") return "/family";
  if (current === "/home") return "/home";
  if (current === "/savings") return "/savings";
  if (current === "/retirement") return "/retirement";
  if (current === "/child") return "/family";
  if (current === "/mortgage" || current === "/mortgage/payoff") return "/home";
  if (current === "/goal") return "/savings";
  if (
    current === "/longevity" ||
    current === "/need" ||
    current === "/when" ||
    current === "/claim" ||
    current === "/housing"
  ) {
    return "/retirement";
  }
  return "/";
}

export const HOME_AFFORDABILITY_NOTE =
  "A calculator for how much house a family can realistically afford is next. It is not on this page yet."

export const CARD_TITLE: Record<string, string> = {
  "/longevity": "How long before I go broke",
  "/need": "How much do I need to last",
  "/when": "When can I stop working",
  "/claim": "Claim Social Security at 67 vs 70",
  "/housing": "Stay home vs CCRC vs nursing",
  "/child": "Nest eggs for a child",
  "/goal": "Will the goal survive",
  "/mortgage": "Can I get a mortgage",
  "/mortgage/payoff": "How much faster can I pay off my mortgage",
};
