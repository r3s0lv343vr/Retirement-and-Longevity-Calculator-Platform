import Link from "next/link";
import type { Metadata } from "next";
import { GuideChrome } from "@/components/GuideChrome";
import { ShouldIPayExtraOnMyMortgage } from "@/components/guides/ShouldIPayExtraOnMyMortgage";
import { TrustBar } from "@/components/CalculatorSeo";
import { HUB_TITLE } from "@/lib/brand";
import {
  EXTRA_VS_SAVINGS_GUIDE,
  extraVsSavingsArticleJsonLd,
  extraVsSavingsBreadcrumbJsonLd,
  extraVsSavingsCanonicalUrl,
  extraVsSavingsFaqJsonLd,
} from "@/lib/guides";

export const metadata: Metadata = {
  title: { absolute: EXTRA_VS_SAVINGS_GUIDE.title },
  description: EXTRA_VS_SAVINGS_GUIDE.description,
  robots: { index: true, follow: true },
  alternates: { canonical: extraVsSavingsCanonicalUrl() },
  openGraph: {
    title: EXTRA_VS_SAVINGS_GUIDE.title,
    description: EXTRA_VS_SAVINGS_GUIDE.description,
    url: extraVsSavingsCanonicalUrl(),
    type: "article",
    siteName: HUB_TITLE,
  },
};

export default function ExtraVsSavingsGuidePage() {
  return (
    <GuideChrome
      current={EXTRA_VS_SAVINGS_GUIDE.path}
      jsonLd={[extraVsSavingsArticleJsonLd(), extraVsSavingsBreadcrumbJsonLd(), extraVsSavingsFaqJsonLd()]}
      footerTitle={EXTRA_VS_SAVINGS_GUIDE.h1}
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
                {EXTRA_VS_SAVINGS_GUIDE.h1}
              </li>
            </ol>
          </nav>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-pine">Home &amp; Mortgage</p>
          <h1 className="mt-2 max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">
            {EXTRA_VS_SAVINGS_GUIDE.h1}
          </h1>
        </div>
      }
    >
      <TrustBar />
      <ShouldIPayExtraOnMyMortgage />
    </GuideChrome>
  );
}
