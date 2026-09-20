import Link from "next/link";
import type { Metadata } from "next";
import { GuideChrome } from "@/components/GuideChrome";
import { MortgagePaymentVsTrueCost } from "@/components/guides/MortgagePaymentVsTrueCost";
import { TrustBar } from "@/components/CalculatorSeo";
import { HUB_TITLE } from "@/lib/brand";
import {
  TRUE_COST_GUIDE,
  trueCostArticleJsonLd,
  trueCostBreadcrumbJsonLd,
  trueCostCanonicalUrl,
  trueCostFaqJsonLd,
} from "@/lib/guides";

export const metadata: Metadata = {
  title: { absolute: TRUE_COST_GUIDE.title },
  description: TRUE_COST_GUIDE.description,
  robots: { index: true, follow: true },
  alternates: { canonical: trueCostCanonicalUrl() },
  openGraph: {
    title: TRUE_COST_GUIDE.title,
    description: TRUE_COST_GUIDE.description,
    url: trueCostCanonicalUrl(),
    type: "article",
    siteName: HUB_TITLE,
  },
};

export default function TrueCostGuidePage() {
  return (
    <GuideChrome
      current={TRUE_COST_GUIDE.path}
      jsonLd={[trueCostArticleJsonLd(), trueCostBreadcrumbJsonLd(), trueCostFaqJsonLd()]}
      footerTitle={TRUE_COST_GUIDE.h1}
      header={
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link
                  href="/guides"
                  className="underline decoration-pine/30 underline-offset-2 hover:text-pine hover:decoration-pine"
                >
                  Guides
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href="/guides/home"
                  className="underline decoration-pine/30 underline-offset-2 hover:text-pine hover:decoration-pine"
                >
                  Home &amp; Mortgage
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-ink" aria-current="page">
                {TRUE_COST_GUIDE.h1}
              </li>
            </ol>
          </nav>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-pine">Home &amp; Mortgage</p>
          <h1 className="mt-2 max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">
            {TRUE_COST_GUIDE.h1}
          </h1>
        </div>
      }
    >
      <TrustBar />
      <MortgagePaymentVsTrueCost />
    </GuideChrome>
  );
}
