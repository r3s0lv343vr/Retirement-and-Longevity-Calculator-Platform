import Link from "next/link";
import type { Metadata } from "next";
import { GuideChrome } from "@/components/GuideChrome";
import { TrustBar } from "@/components/CalculatorSeo";
import { HUB_TITLE } from "@/lib/brand";
import { FAMILY_GUIDE_THEME_PATH, GUIDE_THEMES, familyGuideBreadcrumbJsonLd, familyGuideThemeMetadataUrl } from "@/lib/guides";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Family & Children Guides | Runaway Finance",
  description:
    "Guides on baby affordability, childcare, parental leave and child costs. Use them with the Growing a Family calculators.",
  robots: { index: true, follow: true },
  alternates: { canonical: familyGuideThemeMetadataUrl() },
  openGraph: {
    title: "Family & Children Guides | Runaway Finance",
    description:
      "Guides on baby affordability, childcare, parental leave and child costs. Use them with the Growing a Family calculators.",
    url: familyGuideThemeMetadataUrl(),
    type: "website",
    siteName: HUB_TITLE,
  },
};

export default function FamilyGuidesPage() {
  return (
    <GuideChrome
      current={FAMILY_GUIDE_THEME_PATH}
      jsonLd={familyGuideBreadcrumbJsonLd()}
      footerTitle="Family & Children"
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
              <li className="text-ink" aria-current="page">
                Family &amp; Children
              </li>
            </ol>
          </nav>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-pine">Guides</p>
          <h1 className="mt-2 max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">Family &amp; Children</h1>
          <p className="mt-2 max-w-3xl text-base text-muted sm:text-lg">
            Affordability, how much to save, and nest eggs for raising a child.
          </p>
        </div>
      }
    >
      <TrustBar />
      <ul className="mt-8 space-y-5">
        {GUIDE_THEMES[0]!.articles.map((article) => (
          <li key={article.path}>
            <Link href={article.path} className="card block transition hover:border-pine/30">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Guide</p>
              <h2 className="mt-2 font-serif text-xl text-pine">{article.h1}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{article.description}</p>
            </Link>
          </li>
        ))}
        <li>
          <Link href="/child" className="card block transition hover:border-pine/30">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Calculator</p>
            <h2 className="mt-2 font-serif text-xl text-pine">Nest Eggs for a Child</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Size living, school and a separate university pot, then the yearly add that keeps those costs off salary.
            </p>
          </Link>
        </li>
      </ul>
      <p className="mt-8 text-sm">
        <Link
          href="/family"
          className="font-medium text-pine underline decoration-pine/30 underline-offset-2 hover:decoration-pine"
        >
          See the Growing a Family calculators
        </Link>
      </p>
    </GuideChrome>
  );
}
