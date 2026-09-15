import Link from "next/link";
import type { Metadata } from "next";
import { GuideChrome } from "@/components/GuideChrome";
import { CanIAffordToHaveABaby } from "@/components/guides/CanIAffordToHaveABaby";
import { TrustBar } from "@/components/CalculatorSeo";
import { HUB_TITLE } from "@/lib/brand";
import {
  BABY_AFFORD_GUIDE,
  babyAffordArticleJsonLd,
  babyAffordBreadcrumbJsonLd,
  babyAffordCanonicalUrl,
  babyAffordFaqJsonLd,
} from "@/lib/guides";

export const metadata: Metadata = {
  title: { absolute: BABY_AFFORD_GUIDE.title },
  description: BABY_AFFORD_GUIDE.description,
  robots: { index: true, follow: true },
  alternates: { canonical: babyAffordCanonicalUrl() },
  openGraph: {
    title: BABY_AFFORD_GUIDE.title,
    description: BABY_AFFORD_GUIDE.description,
    url: babyAffordCanonicalUrl(),
    type: "article",
    siteName: HUB_TITLE,
  },
};

export default function BabyAffordGuidePage() {
  return (
    <GuideChrome
      current={BABY_AFFORD_GUIDE.path}
      jsonLd={[babyAffordArticleJsonLd(), babyAffordBreadcrumbJsonLd(), babyAffordFaqJsonLd()]}
      footerTitle={BABY_AFFORD_GUIDE.h1}
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
                  href="/guides/family"
                  className="underline decoration-pine/30 underline-offset-2 hover:text-pine hover:decoration-pine"
                >
                  Family &amp; Children
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-ink" aria-current="page">
                {BABY_AFFORD_GUIDE.h1}
              </li>
            </ol>
          </nav>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-pine">Family &amp; Children</p>
          <h1 className="mt-2 max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">
            {BABY_AFFORD_GUIDE.h1}
          </h1>
        </div>
      }
    >
      <TrustBar />
      <CanIAffordToHaveABaby />
    </GuideChrome>
  );
}
