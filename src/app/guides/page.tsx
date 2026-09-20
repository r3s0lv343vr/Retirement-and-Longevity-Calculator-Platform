import { GuideChrome } from "@/components/GuideChrome";
import { TrustBar } from "@/components/CalculatorSeo";
import { GUIDE_THEMES } from "@/lib/guides";
import { SITE_URL } from "@/lib/seo";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guides – Family Finance Articles and Calculator Paths",
  description:
    "Family & Children and Home & Mortgage guides plus short paths to the Runaway Finance calculators for home, savings and retirement decisions.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/guides` },
};

const CALCULATOR_PATHS = [
  {
    href: "/mortgage",
    title: "What the house actually costs once tax and life sit beside the payment",
    body: "Can I Get a Mortgage separates P&I from housing cost and shows whether a buffer remains. Already have the loan? Use Mortgage Payoff for time reclaimed.",
  },
  {
    href: "/goal",
    title: "Whether everyday expenses raid a savings goal",
    body: "Will the Goal Survive raids emergency and other savings first. The earmarked pot is last. Use it when a house or a child is competing with a named goal.",
  },
  {
    href: "/longevity",
    title: "How long retirement savings may last",
    body: "How Long Before I Go Broke is the year-by-year outlook. How much and When are the inverses. 67 vs 70 and later-life housing sit beside that plan.",
  },
  {
    href: "/housing",
    title: "Stay home vs CCRC vs nursing",
    body: "Later-life housing is its own calculator. It belongs with retirement, and it still cross-links from the Home journey.",
  },
];

export default function GuidesPage() {
  return (
    <GuideChrome
      current="/guides"
      header={
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Family finance</p>
          <h1 className="mt-2 max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">Guides</h1>
          <p className="mt-2 max-w-3xl text-base text-muted sm:text-lg">
            Start with Family &amp; Children or Home &amp; Mortgage, then use the calculator paths for savings and
            retirement.
          </p>
        </div>
      }
    >
      <TrustBar />
      {GUIDE_THEMES.map((theme) => (
        <section key={theme.path} className="mt-8" aria-labelledby={`${theme.path.replace(/\//g, "-")}-theme`}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Theme</p>
          <h2 id={`${theme.path.replace(/\//g, "-")}-theme`} className="mt-2 font-serif text-2xl text-pine">
            {theme.title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{theme.description}</p>
          <ul className="mt-5 space-y-5">
            {theme.articles.map((article) => (
              <li key={article.path}>
                <Link href={article.path} className="card block transition hover:border-pine/30">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Guide</p>
                  <h3 className="mt-2 font-serif text-xl text-pine">{article.h1}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{article.description}</p>
                </Link>
              </li>
            ))}
            <li>
              <Link href={theme.path} className="card block transition hover:border-pine/30">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Theme hub</p>
                <h3 className="mt-2 font-serif text-xl text-pine">All {theme.title} guides</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{theme.question}</p>
              </Link>
            </li>
          </ul>
        </section>
      ))}
      <section className="mt-12" aria-labelledby="calculator-paths">
        <h2 id="calculator-paths" className="font-serif text-2xl text-pine">
          Calculator paths
        </h2>
        <ul className="mt-5 space-y-5">
          {CALCULATOR_PATHS.map((guide) => (
            <li key={guide.href}>
              <Link href={guide.href} className="card block transition hover:border-pine/30">
                <h3 className="font-serif text-xl text-pine">{guide.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{guide.body}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </GuideChrome>
  );
}
