import { AdSlot } from "@/components/AdSlot";
import { CalculatorSeoBlock, RelatedCalculators } from "@/components/CalculatorSeo";
import { ClusterNav } from "@/components/ClusterNav";
import { TrustFooterLinks } from "@/components/TrustFooterLinks";
import { PayoffApp } from "@/components/payoff/PayoffApp";
import { JsonLd } from "@/components/JsonLd";
import { HUB_TITLE } from "@/lib/brand";
import { EXTRA_VS_SAVINGS_PATH } from "@/lib/guides";
import { breadcrumbJsonLd, calculatorMetadata, CALCULATOR_SEO, SITE_URL, webPageJsonLd } from "@/lib/seo";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = calculatorMetadata("/mortgage/payoff");

const seo = CALCULATOR_SEO["/mortgage/payoff"];

function payoffBreadcrumb() {
  const base = breadcrumbJsonLd("/mortgage");
  return {
    ...base,
    itemListElement: [
      ...(base.itemListElement as Record<string, unknown>[]),
      { "@type": "ListItem", position: 3, name: seo.name, item: `${SITE_URL}/mortgage/payoff` },
    ],
  };
}

export default function MortgagePayoffPage() {
  return (
    <div className="paper-rule min-h-screen">
      <JsonLd data={[webPageJsonLd("/mortgage/payoff"), payoffBreadcrumb()]} />
      <ClusterNav current="/mortgage/payoff" />
      <header className="border-b border-pine/10 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
          <h1 className="max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">{seo.name}</h1>
          <p className="mt-2 text-base text-muted sm:text-lg">How much faster can I pay off my mortgage?</p>
        </div>
      </header>

      <AdSlot placement="header-leaderboard" className="mx-auto max-w-5xl px-5 py-4 sm:px-6" />

      <main className="mx-auto max-w-5xl px-5 pb-16 sm:px-6">
        <CalculatorSeoBlock seo={seo} />
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-muted">
          Deciding whether the extra belongs on the loan or in cash?{" "}
          <Link
            href={EXTRA_VS_SAVINGS_PATH}
            className="font-medium text-pine underline decoration-pine/30 underline-offset-2 hover:decoration-pine"
          >
            Read Should I Pay Extra on My Mortgage or Keep the Money in Savings?
          </Link>
        </p>
        <PayoffApp />
        <RelatedCalculators seo={seo} />
      </main>

      <footer className="border-t border-pine/10 bg-pine text-paper">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
          <AdSlot placement="footer" className="mb-4 border-paper/20 bg-paper/10 text-paper/80" />
          <AdSlot placement="footer-2" className="mb-6 border-paper/20 bg-paper/10 text-paper/80" />
          <p className="font-serif text-xl leading-snug">{seo.name}</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-paper/75">{seo.limitations}</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-paper/75">
            {HUB_TITLE} does not receive or store this mortgage plan. Optional save stays in this browser only.
          </p>
          <TrustFooterLinks />
        </div>
      </footer>
    </div>
  );
}
