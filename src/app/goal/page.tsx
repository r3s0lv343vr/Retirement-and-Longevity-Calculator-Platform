import { AdSlot } from "@/components/AdSlot";
import { CalculatorSeoBlock, RelatedCalculators } from "@/components/CalculatorSeo";
import { ClusterNav } from "@/components/ClusterNav";
import { GoalApp } from "@/components/GoalApp";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, calculatorMetadata, CALCULATOR_SEO, webPageJsonLd } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = calculatorMetadata("/goal");

const seo = CALCULATOR_SEO["/goal"];

export default function GoalPage() {
  return (
    <div className="paper-rule min-h-screen">
      <JsonLd data={[webPageJsonLd("/goal"), breadcrumbJsonLd("/goal")]} />
      <ClusterNav current="/goal" />
      <header className="border-b border-pine/10 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
          <h1 className="max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">{seo.name}</h1>
          <p className="mt-2 text-base text-muted sm:text-lg">
            Competing expenses vs the pot you marked for one goal
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-4 sm:px-6">
        <AdSlot placement="header-leaderboard" />
      </div>

      <main className="mx-auto max-w-5xl px-5 pb-16 sm:px-6">
        <CalculatorSeoBlock seo={seo} />
        <GoalApp />
        <RelatedCalculators seo={seo} />
      </main>

      <footer className="border-t border-pine/10 bg-pine text-paper">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
          <AdSlot placement="footer" className="mb-4 border-paper/20 bg-paper/10 text-paper/80" />
          <AdSlot placement="footer-2" className="mb-6 border-paper/20 bg-paper/10 text-paper/80" />
          <p className="font-serif text-xl leading-snug">{seo.name}</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-paper/75">{seo.limitations}</p>
        </div>
      </footer>
    </div>
  );
}
