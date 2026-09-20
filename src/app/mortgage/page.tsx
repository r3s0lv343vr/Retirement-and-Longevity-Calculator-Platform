import { AdSlot } from "@/components/AdSlot";
import { CalculatorSeoBlock, RelatedCalculators } from "@/components/CalculatorSeo";
import { ClusterNav } from "@/components/ClusterNav";
import { TrustFooterLinks } from "@/components/TrustFooterLinks";
import { MortgageApp } from "@/components/MortgageApp";
import { JsonLd } from "@/components/JsonLd";
import { TRUE_COST_PATH } from "@/lib/guides";
import { breadcrumbJsonLd, calculatorMetadata, CALCULATOR_SEO, webPageJsonLd } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = calculatorMetadata("/mortgage");

const seo = CALCULATOR_SEO["/mortgage"];

export default function MortgagePage() {
  return (
    <div className="paper-rule min-h-screen">
      <JsonLd data={[webPageJsonLd("/mortgage"), breadcrumbJsonLd("/mortgage")]} />
      <ClusterNav current="/mortgage" />
      <header className="border-b border-pine/10 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
          <h1 className="max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">{seo.name}</h1>
          <p className="mt-2 text-base text-muted sm:text-lg">What will this house actually cost you?</p>
          <p className="mt-3 text-sm">
            <Link
              href={TRUE_COST_PATH}
              className="font-medium text-pine underline decoration-pine/30 underline-offset-2 hover:decoration-pine"
            >
              Read Mortgage Payment vs. the True Cost of Owning a Home
            </Link>
          </p>
          <p className="mt-2 text-sm">
            <Link
              href="/mortgage/payoff"
              className="font-medium text-pine underline decoration-pine/30 underline-offset-2 hover:decoration-pine"
            >
              Already have the loan? See how much faster you can pay it off
            </Link>
          </p>
        </div>
      </header>

      <AdSlot placement="header-leaderboard" className="mx-auto max-w-5xl px-5 py-4 sm:px-6" />

      <main className="mx-auto max-w-5xl px-5 pb-16 sm:px-6">
        <CalculatorSeoBlock seo={seo} />
        <MortgageApp />
        <RelatedCalculators seo={seo} />
      </main>

      <footer className="border-t border-pine/10 bg-pine text-paper">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
          <AdSlot placement="footer" className="mb-4 border-paper/20 bg-paper/10 text-paper/80" />
          <AdSlot placement="footer-2" className="mb-6 border-paper/20 bg-paper/10 text-paper/80" />
          <p className="font-serif text-xl leading-snug">{seo.name}</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-paper/75">{seo.limitations}</p>
          <TrustFooterLinks />
        </div>
      </footer>
    </div>
  );
}
