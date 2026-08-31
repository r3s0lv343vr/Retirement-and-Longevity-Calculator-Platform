import { ClusterNav } from "@/components/ClusterNav";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Retirement and Longevity Calculators",
  description:
    "A small cluster of retirement calculators. How long savings last, and how much you need so the plan lasts through a given age.",
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

      <main className="mx-auto max-w-5xl px-5 pb-16 pt-8 sm:px-6">
        <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          The longevity calculator is unchanged. This hub is only a front door. A second tool asks the inverse: how
          much you need today so the plan lasts through the age you set.
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
