import { TrustPageShell } from "@/components/TrustPageShell";
import { BUILDER_NAME, CONTACT_EMAIL, HUB_WHY, OPERATOR_NAME } from "@/lib/brand";
import { organizationJsonLd } from "@/lib/trust";
import { trustMetadata } from "@/lib/trust";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = trustMetadata("/about");

export default function AboutPage() {
  return (
    <TrustPageShell path="/about" jsonLd={organizationJsonLd()}>
      <div className="space-y-5 font-serif text-xl leading-snug text-ink sm:text-2xl">
        {HUB_WHY.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>
      <p className="mt-8 text-base leading-relaxed text-muted sm:text-lg">
        Built by {BUILDER_NAME}. {OPERATOR_NAME} operates the studio. Site questions:{" "}
        <a className="font-medium text-pine underline decoration-pine/30 underline-offset-2" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
        . That address is for the website, not personal financial advice.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        <Link href="/contact" className="text-pine underline decoration-pine/30 underline-offset-2">
          Contact
        </Link>
        {" · "}
        <Link href="/privacy" className="text-pine underline decoration-pine/30 underline-offset-2">
          Privacy
        </Link>
        {" · "}
        <Link href="/disclaimer" className="text-pine underline decoration-pine/30 underline-offset-2">
          Disclaimer
        </Link>
      </p>
    </TrustPageShell>
  );
}
