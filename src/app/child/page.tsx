import { AdSlot } from "@/components/AdSlot";
import { CalculatorSeoBlock, RelatedCalculators } from "@/components/CalculatorSeo";
import { ChildApp } from "@/components/ChildApp";
import { ClusterNav } from "@/components/ClusterNav";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, calculatorMetadata, CALCULATOR_SEO, webPageJsonLd } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = calculatorMetadata("/child");

const seo = CALCULATOR_SEO["/child"];

export default function ChildPage() {
  return (
    <div className="paper-rule min-h-screen">
      <JsonLd data={[webPageJsonLd("/child"), breadcrumbJsonLd("/child")]} />
      <ClusterNav current="/child" />
      <header className="border-b border-pine/10 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
          <h1 className="max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">{seo.name}</h1>
          <p className="mt-2 text-base text-muted sm:text-lg">When you are ready, through 18, then university</p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-4 sm:px-6">
        <AdSlot placement="header-leaderboard" />
      </div>

      <main className="mx-auto max-w-5xl px-5 pb-16 sm:px-6">
        <CalculatorSeoBlock seo={seo} />
        <ChildApp />
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
