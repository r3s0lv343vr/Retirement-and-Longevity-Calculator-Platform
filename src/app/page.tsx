import { AdSlot } from "@/components/AdSlot";
import { ClusterNav } from "@/components/ClusterNav";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Retirement and Longevity Calculators",
  description:
    "A small cluster of retirement calculators. How long savings last, how much nest egg you need, when work can end, and claiming Social Security at 67 vs 70.",
};

const TOOLS = [
  {
    href: "/longevity",
    title: "How long before I go broke",
    question: "Given what I have, how far does the money go?",
    note: "The original calculator. Year-by-year outlook, healthcare, later-life housing, two persons, and a PDF.",
  },
  {
    href: "/need",
    title: "How much do I need to last",
    question: "How much nest egg today funds this plan through a given age?",
    note: "The inverse. Short form. Uses your entered spending and income, not the comfortable-living suggestion.",
  },
  {
    href: "/when",
    title: "When can I stop working",
    question: "Given what I have, how soon can full-time work end?",
    note: "Solves for work-end age, not nest egg. Same entered plan as How much; earliest age that still lasts.",
  },
  {
    href: "/claim",
    title: "Claim Social Security at 67 vs 70",
    question: "Does delaying the check from 67 to 70 make the plan last longer?",
    note: "One short run. Same delayed-credit math as the How long compare card, which stays on that outlook.",
  },
] as const;

export default function HubPage() {
  return (
    <div className="paper-rule min-h-screen">
      <ClusterNav current="/" />
      <header className="border-b border-pine/10 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
          <h1 className="max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">
            Retirement and Longevity Calculators
          </h1>
          <p className="mt-2 text-base text-muted sm:text-lg">Each tool answers one question.</p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-4 sm:px-6">
        <AdSlot placement="header-leaderboard" />
      </div>

      <main className="mx-auto max-w-5xl px-5 pb-16 pt-4 sm:px-6">
        <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          The longevity calculator is unchanged. This hub is only a front door. Sibling tools ask how much nest egg
          you need today, how soon full-time work can end, and whether claiming Social Security at 67 or 70 lasts
          farther.
        </p>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <li key={tool.href}>
              <Link href={tool.href} className="card block h-full transition hover:border-pine/30">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Calculator</p>
                <h2 className="mt-2 font-serif text-2xl text-pine">{tool.title}</h2>
                <p className="mt-3 text-sm font-medium text-ink">{tool.question}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{tool.note}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <footer className="border-t border-pine/10 bg-pine text-paper">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
          <AdSlot placement="footer" className="mb-4 border-paper/20 bg-paper/10 text-paper/80" />
          <AdSlot placement="footer-2" className="mb-6 border-paper/20 bg-paper/10 text-paper/80" />
          <p className="font-serif text-xl leading-snug">Retirement and Longevity Calculators</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-paper/75">
            Educational projection only. It is not tax, investment, or medical advice. Markets, inflation, health, and
            policy can all move against any model. Compare this outlook with a licensed advisor before making decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
