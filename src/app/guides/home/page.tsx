import Link from "next/link";
import type { Metadata } from "next";
import { GuideChrome } from "@/components/GuideChrome";
import { TrustBar } from "@/components/CalculatorSeo";
import { HUB_TITLE } from "@/lib/brand";
import {
  GUIDE_THEMES,
  HOME_GUIDE_THEME_PATH,
  homeGuideBreadcrumbJsonLd,
  homeGuideThemeMetadataUrl,
} from "@/lib/guides";

const theme = GUIDE_THEMES.find((item) => item.path === HOME_GUIDE_THEME_PATH)!;

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Home & Mortgage Guides | Runaway Finance",
  description:
    "Guides on the true cost of owning a house, extra payments versus savings, and the payoff path. Use them with the Buying a Home calculators.",
  robots: { index: true, follow: true },
  alternates: { canonical: homeGuideThemeMetadataUrl() },
  openGraph: {
    title: "Home & Mortgage Guides | Runaway Finance",
    description:
      "Guides on the true cost of owning a house, extra payments versus savings, and the payoff path. Use them with the Buying a Home calculators.",
    url: homeGuideThemeMetadataUrl(),
    type: "website",
    siteName: HUB_TITLE,
  },
};

export default function HomeGuidesPage() {
  return (
    <GuideChrome
      current={HOME_GUIDE_THEME_PATH}
      jsonLd={homeGuideBreadcrumbJsonLd()}
      footerTitle="Home & Mortgage"
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
                Home &amp; Mortgage
              </li>
            </ol>
          </nav>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-pine">Guides</p>
          <h1 className="mt-2 max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">Home &amp; Mortgage</h1>
          <p className="mt-2 max-w-3xl text-base text-muted sm:text-lg">{theme.question}</p>
        </div>
      }
    >
      <TrustBar />
      <ul className="mt-8 space-y-5">
        {theme.articles.map((article) => (
          <li key={article.path}>
            <Link href={article.path} className="card block transition hover:border-pine/30">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Guide</p>
              <h2 className="mt-2 font-serif text-xl text-pine">{article.h1}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{article.description}</p>
            </Link>
          </li>
        ))}
        <li>
          <Link href="/mortgage" className="card block transition hover:border-pine/30">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Calculator</p>
            <h2 className="mt-2 font-serif text-xl text-pine">Can I get a mortgage</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Principal and interest sit on one line. Tax, insurance, PMI, HOA, and upkeep sit beside them as housing
              cost.
            </p>
          </Link>
        </li>
        <li>
          <Link href="/mortgage/payoff" className="card block transition hover:border-pine/30">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Calculator</p>
            <h2 className="mt-2 font-serif text-xl text-pine">How much faster can I pay off my mortgage</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Extra monthly, annual, and lump-sum payments change the payoff date and interest avoided. Extra is
              principal only. The scheduled payment is not recast.
            </p>
          </Link>
        </li>
      </ul>
      <p className="mt-8 text-sm">
        <Link
          href="/home"
          className="font-medium text-pine underline decoration-pine/30 underline-offset-2 hover:decoration-pine"
        >
          See the Buying a Home calculators
        </Link>
      </p>
    </GuideChrome>
  );
}
