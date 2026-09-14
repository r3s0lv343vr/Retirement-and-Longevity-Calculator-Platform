import { AdSlot } from "@/components/AdSlot";
import { ClusterNav } from "@/components/ClusterNav";
import { TrustFooterLinks } from "@/components/TrustFooterLinks";
import { TrustBar } from "@/components/CalculatorSeo";
import { HUB_TITLE } from "@/lib/brand";
import { SITE_URL } from "@/lib/seo";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guides – How to Use These Family Finance Calculators",
  description:
    "Short guides that connect family, home, savings and retirement decisions to the Runaway Finance calculators. Not a blog of thin articles.",
  alternates: { canonical: `${SITE_URL}/guides` },
};

const GUIDES = [
  {
    href: "/child",
    title: "What having a child could cost through 18 and university",
    body: "Use Nest Eggs for a Child to size living, school and a separate university pot, then the yearly add that keeps those costs off salary.",
  },
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
    <div className="paper-rule min-h-screen">
      <ClusterNav current="/guides" />
      <header className="border-b border-pine/10 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Family finance</p>
          <h1 className="mt-2 max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">Guides</h1>
          <p className="mt-2 max-w-3xl text-base text-muted sm:text-lg">
            Short paths from a household question to the calculator that answers it. These are not standalone articles.
          </p>
        </div>
      </header>
      <AdSlot placement="header-leaderboard" className="mx-auto max-w-5xl px-5 py-4 sm:px-6" />
      <main className="mx-auto max-w-5xl px-5 pb-16 pt-4 sm:px-6">
        <TrustBar />
        <ul className="mt-8 space-y-5">
          {GUIDES.map((guide) => (
            <li key={guide.href}>
              <Link href={guide.href} className="card block transition hover:border-pine/30">
                <h2 className="font-serif text-xl text-pine">{guide.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{guide.body}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <footer className="border-t border-pine/10 bg-pine text-paper">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
          <p className="font-serif text-xl leading-snug">{HUB_TITLE}</p>
          <TrustFooterLinks />
        </div>
      </footer>
    </div>
  );
}
