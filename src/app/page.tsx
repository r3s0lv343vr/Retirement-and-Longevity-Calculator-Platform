import { AdSlot } from "@/components/AdSlot";
import { ClusterNav } from "@/components/ClusterNav";
import { JsonLd } from "@/components/JsonLd";
import { TrustBar } from "@/components/CalculatorSeo";
import { HUB_BLURB, HUB_TAGLINE, HUB_TITLE } from "@/lib/brand";
import { CALCULATOR_SEO, HUB_CLUSTERS, SEO_POSITIONING, hubMetadata, websiteJsonLd } from "@/lib/seo";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = hubMetadata();

const CARD_TITLE: Record<string, string> = {
  "/longevity": "How long before I go broke",
  "/need": "How much do I need to last",
  "/when": "When can I stop working",
  "/claim": "Claim Social Security at 67 vs 70",
  "/housing": "Stay home vs CCRC vs nursing",
  "/child": "Nest eggs for a child",
  "/goal": "Will the goal survive",
};

const HUB_NOTES: Record<string, string> = {
  "/longevity": "The original calculator. Year-by-year outlook, healthcare, later-life housing, two persons, and a PDF.",
  "/need": "The inverse. Short form. Uses your entered spending and income, not the comfortable-living suggestion.",
  "/when": "Solves for work-end age, not nest egg. Same entered plan as How much; earliest age that still lasts.",
  "/claim": "One short run. Same delayed-credit math as the How long compare card, which stays on that outlook.",
  "/housing": "Three exclusive runs. Not six more cells on the longevity form.",
  "/child":
    "Time to save to the present value of growing living costs through 18, then school and a separate university pot. Solves the yearly add. School and university use education inflation.",
  "/goal": "Goal-agnostic. Emergency and other savings are raided first. The earmarked pot is last.",
};

export default function HubPage() {
  return (
    <div className="paper-rule min-h-screen">
      <JsonLd data={websiteJsonLd()} />
      <ClusterNav current="/" />
      <header className="border-b border-pine/10 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">
            Financial planning calculators
          </p>
          <h1 className="mt-2 max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">{HUB_TITLE}</h1>
          <p className="mt-2 text-base text-muted sm:text-lg">{HUB_TAGLINE}</p>
          <p className="mt-1 text-sm text-muted">{SEO_POSITIONING}</p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-4 sm:px-6">
        <AdSlot placement="header-leaderboard" />
      </div>

      <main className="mx-auto max-w-5xl px-5 pb-16 pt-4 sm:px-6">
        <p className="max-w-3xl font-serif text-xl leading-snug text-ink sm:text-2xl">{HUB_BLURB}</p>
        <div className="mt-4">
          <TrustBar className="text-sm leading-relaxed text-muted sm:text-base" />
        </div>
        <div className="mt-10 space-y-10">
          {HUB_CLUSTERS.map((cluster) => (
            <section key={cluster.id} aria-labelledby={`cluster-${cluster.id}`}>
              <h2 id={`cluster-${cluster.id}`} className="font-serif text-2xl text-pine">
                {cluster.title}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted">{cluster.note}</p>
              <ul className="mt-4 grid gap-5 sm:grid-cols-2">
                {cluster.paths.map((path) => {
                  const seo = CALCULATOR_SEO[path];
                  return (
                    <li key={path}>
                      <Link href={path} className="card block h-full transition hover:border-pine/30">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Calculator</p>
                        <h3 className="mt-2 font-serif text-2xl text-pine">{CARD_TITLE[path]}</h3>
                        <p className="mt-3 text-sm font-medium text-ink">{seo.question}</p>
                        <p className="mt-2 text-sm leading-relaxed text-muted">{HUB_NOTES[path]}</p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-pine/10 bg-pine text-paper">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
          <AdSlot placement="footer" className="mb-4 border-paper/20 bg-paper/10 text-paper/80" />
          <AdSlot placement="footer-2" className="mb-6 border-paper/20 bg-paper/10 text-paper/80" />
          <p className="font-serif text-xl leading-snug">{HUB_TITLE}</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-paper/75">
            Educational projection only. It is not tax, investment, or medical advice. Markets, inflation, health, and
            policy can all move against any model. Compare this outlook with a licensed advisor before making decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
