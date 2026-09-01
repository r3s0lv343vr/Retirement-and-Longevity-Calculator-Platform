import Link from "next/link";
import { SEO_REVIEWED, SEO_TRUST, type CalculatorSeo } from "@/lib/seo";

export function TrustBar() {
  return <p className="text-xs leading-relaxed text-muted">{SEO_TRUST}</p>;
}

export function CalculatorSeoBlock({ seo }: { seo: CalculatorSeo }) {
  return (
    <section className="max-w-3xl pb-8 pt-2">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">{seo.eyebrow}</p>
      <p className="mt-2 font-serif text-xl leading-snug text-ink sm:text-2xl">{seo.seoCall}</p>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted sm:text-base">
        <p>
          <span className="font-medium text-ink">How this calculator works. </span>
          {seo.howItWorks}
        </p>
        <p>
          <span className="font-medium text-ink">Limitations. </span>
          {seo.limitations} Last reviewed {SEO_REVIEWED}.
        </p>
      </div>
      <div className="mt-4">
        <TrustBar />
      </div>
    </section>
  );
}

export function RelatedCalculators({ seo }: { seo: CalculatorSeo }) {
  if (seo.related.length === 0) return null;
  return (
    <nav className="mt-10 max-w-3xl" aria-label="Related calculators">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Next question</p>
      <ul className="mt-3 space-y-2">
        {seo.related.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm font-medium text-pine underline decoration-pine/30 underline-offset-2 hover:decoration-pine"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
