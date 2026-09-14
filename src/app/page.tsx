import { AdSlot } from "@/components/AdSlot";
import { ClusterNav } from "@/components/ClusterNav";
import { JsonLd } from "@/components/JsonLd";
import { TrustBar } from "@/components/CalculatorSeo";
import { TrustFooterLinks } from "@/components/TrustFooterLinks";
import { HUB_TITLE } from "@/lib/brand";
import { CARD_TITLE, JOURNEYS } from "@/lib/journeys";
import { CALCULATOR_SEO, hubMetadata, websiteJsonLd } from "@/lib/seo";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = hubMetadata();

const FEATURED = ["/child", "/mortgage", "/goal", "/longevity"] as const;

export default function HubPage() {
  return (
    <div className="paper-rule min-h-screen">
      <JsonLd data={websiteJsonLd()} />
      <ClusterNav current="/" />
      <header className="border-b border-pine/10 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Family finance calculators</p>
          <h1 className="mt-2 max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">
            Make life&apos;s biggest financial decisions with the numbers in front of you.
          </h1>
          <p className="mt-2 max-w-3xl text-base text-muted sm:text-lg">
            Free calculators for growing your family, buying a home, reaching savings goals and planning retirement.
            Model the trade-offs, test different scenarios and see what the numbers mean for your household.
          </p>
        </div>
      </header>

      <AdSlot placement="header-leaderboard" className="mx-auto max-w-5xl px-5 py-4 sm:px-6" />

      <main className="mx-auto max-w-5xl px-5 pb-16 pt-4 sm:px-6">
        <p className="max-w-3xl font-serif text-xl leading-snug text-ink sm:text-2xl">
          Runaway Finance is a family-finance calculator platform. Retirement stays a major pillar — it is not the only
          one.
        </p>
        <div className="mt-4">
          <TrustBar className="text-sm leading-relaxed text-muted sm:text-base" />
        </div>

        <h2 className="mt-10 font-serif text-2xl text-pine">Four journeys</h2>
        <ul className="mt-4 grid gap-5 sm:grid-cols-2">
          {JOURNEYS.map((journey) => (
            <li key={journey.id}>
              <Link href={journey.path} className="card block h-full transition hover:border-pine/30">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">{journey.nav}</p>
                <h3 className="mt-2 font-serif text-2xl text-pine">{journey.title}</h3>
                <p className="mt-3 text-sm font-medium text-ink">{journey.question}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{journey.intro}</p>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mt-10 font-serif text-2xl text-pine">Start a calculator</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          The homepage links straight to the tools, not only to category pages.
        </p>
        <ul className="mt-4 grid gap-5 sm:grid-cols-2">
          {FEATURED.map((path) => {
            const seo = CALCULATOR_SEO[path];
            return (
              <li key={path}>
                <Link href={path} className="card block h-full transition hover:border-pine/30">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Calculator</p>
                  <h3 className="mt-2 font-serif text-2xl text-pine">{CARD_TITLE[path]}</h3>
                  <p className="mt-3 text-sm font-medium text-ink">{seo.question}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>

      <footer className="border-t border-pine/10 bg-pine text-paper">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
          <AdSlot placement="footer" className="mb-4 border-paper/20 bg-paper/10 text-paper/80" />
          <AdSlot placement="footer-2" className="mb-6 border-paper/20 bg-paper/10 text-paper/80" />
          <p className="font-serif text-xl leading-snug">{HUB_TITLE}</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-paper/75">
            Educational projection only. It is not tax, investment, or medical advice. Compare this outlook with a
            licensed advisor before making decisions.
          </p>
          <TrustFooterLinks />
        </div>
      </footer>
    </div>
  );
}
