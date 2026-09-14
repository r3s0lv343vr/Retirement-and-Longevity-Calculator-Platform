import { AdSlot } from "@/components/AdSlot";
import { ClusterNav } from "@/components/ClusterNav";
import { TrustFooterLinks } from "@/components/TrustFooterLinks";
import { TrustBar } from "@/components/CalculatorSeo";
import { CALCULATOR_SEO } from "@/lib/seo";
import { CARD_TITLE, HOME_AFFORDABILITY_NOTE, type Journey } from "@/lib/journeys";
import Link from "next/link";

export function CategoryHub({ journey }: { journey: Journey }) {
  return (
    <div className="paper-rule min-h-screen">
      <ClusterNav current={journey.path} />
      <header className="border-b border-pine/10 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Family finance</p>
          <h1 className="mt-2 max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">{journey.title}</h1>
          <p className="mt-2 text-base text-muted sm:text-lg">{journey.question}</p>
        </div>
      </header>
      <AdSlot placement="header-leaderboard" className="mx-auto max-w-5xl px-5 py-4 sm:px-6" />
      <main className="mx-auto max-w-5xl px-5 pb-16 pt-4 sm:px-6">
        <p className="max-w-3xl font-serif text-xl leading-snug text-ink sm:text-2xl">{journey.intro}</p>
        <div className="mt-4">
          <TrustBar />
        </div>
        <h2 className="mt-10 font-serif text-2xl text-pine">Calculators in this journey</h2>
        <ul className="mt-4 grid gap-5 sm:grid-cols-2">
          {journey.calculators.map((path) => {
            const seo = CALCULATOR_SEO[path];
            return (
              <li key={path}>
                <Link href={path} className="card block h-full transition hover:border-pine/30">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Calculator</p>
                  <h3 className="mt-2 font-serif text-2xl text-pine">{CARD_TITLE[path]}</h3>
                  <p className="mt-3 text-sm font-medium text-ink">{seo.question}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{seo.seoCall}</p>
                </Link>
              </li>
            );
          })}
        </ul>
        {journey.id === "home" ? <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">{HOME_AFFORDABILITY_NOTE}</p> : null}
        <h2 className="mt-10 font-serif text-2xl text-pine">Related decisions</h2>
        <ul className="mt-3 space-y-2">
          {journey.also.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-pine underline decoration-pine/30 underline-offset-2 hover:decoration-pine"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <footer className="border-t border-pine/10 bg-pine text-paper">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
          <p className="font-serif text-xl leading-snug">{journey.title}</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-paper/75">
            Educational projection only. Existing calculator URLs are unchanged.
          </p>
          <TrustFooterLinks />
        </div>
      </footer>
    </div>
  );
}
