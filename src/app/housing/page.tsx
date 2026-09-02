import { AdSlot } from "@/components/AdSlot";
import { CalculatorSeoBlock, RelatedCalculators } from "@/components/CalculatorSeo";
import { ClusterNav } from "@/components/ClusterNav";
import { TrustFooterLinks } from "@/components/TrustFooterLinks";
import { HousingApp } from "@/components/HousingApp";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, calculatorMetadata, CALCULATOR_SEO, webPageJsonLd } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = calculatorMetadata("/housing");

const seo = CALCULATOR_SEO["/housing"];

export default function HousingPage() {
  return (
    <div className="paper-rule min-h-screen">
      <JsonLd data={[webPageJsonLd("/housing"), breadcrumbJsonLd("/housing")]} />
      <ClusterNav current="/housing" />
      <header className="border-b border-pine/10 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
          <h1 className="max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">{seo.name}</h1>
          <p className="mt-2 text-base text-muted sm:text-lg">Later-life housing as a compare, not six more cells</p>
        </div>
      </header>

      <AdSlot placement="header-leaderboard" className="mx-auto max-w-5xl px-5 py-4 sm:px-6" />

      <main className="mx-auto max-w-5xl px-5 pb-16 sm:px-6">
        <CalculatorSeoBlock seo={seo} />
        <HousingApp />
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
