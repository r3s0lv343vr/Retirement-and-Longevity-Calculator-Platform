import Link from "next/link";
import type { Metadata } from "next";
import { GuideChrome } from "@/components/GuideChrome";
import { HowMuchToSaveBeforeABaby } from "@/components/guides/HowMuchToSaveBeforeABaby";
import { TrustBar } from "@/components/CalculatorSeo";
import { HUB_TITLE } from "@/lib/brand";
import {
  BABY_SAVE_GUIDE,
  babySaveArticleJsonLd,
  babySaveBreadcrumbJsonLd,
  babySaveCanonicalUrl,
  babySaveFaqJsonLd,
} from "@/lib/guides";

export const metadata: Metadata = {
  title: { absolute: BABY_SAVE_GUIDE.title },
  description: BABY_SAVE_GUIDE.description,
  robots: { index: true, follow: true },
  alternates: { canonical: babySaveCanonicalUrl() },
  openGraph: {
    title: BABY_SAVE_GUIDE.title,
    description: BABY_SAVE_GUIDE.description,
    url: babySaveCanonicalUrl(),
    type: "article",
    siteName: HUB_TITLE,
  },
};

export default function BabySaveGuidePage() {
  return (
    <GuideChrome
      current={BABY_SAVE_GUIDE.path}
      jsonLd={[babySaveArticleJsonLd(), babySaveBreadcrumbJsonLd(), babySaveFaqJsonLd()]}
      footerTitle={BABY_SAVE_GUIDE.h1}
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
                {BABY_SAVE_GUIDE.h1}
              </li>
            </ol>
          </nav>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-pine">Family &amp; Children</p>
          <h1 className="mt-2 max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">
            {BABY_SAVE_GUIDE.h1}
          </h1>
        </div>
      }
    >
      <TrustBar />
      <HowMuchToSaveBeforeABaby />
    </GuideChrome>
  );
}
