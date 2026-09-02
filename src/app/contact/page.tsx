import { TrustPageShell } from "@/components/TrustPageShell";
import { BUILDER_NAME, CONTACT_EMAIL, HUB_TITLE } from "@/lib/brand";
import { trustMetadata } from "@/lib/trust";
import type { Metadata } from "next";

export const metadata: Metadata = trustMetadata("/contact");

export default function ContactPage() {
  return (
    <TrustPageShell path="/contact">
      <p className="font-serif text-xl leading-snug text-ink sm:text-2xl">
        {HUB_TITLE} is built by {BUILDER_NAME}. Use this address for the website, not for personal financial advice.
      </p>
      <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
        Email{" "}
        <a className="font-medium text-pine underline decoration-pine/30 underline-offset-2" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
        .
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        We can answer questions about how a calculator works, a bug, or the site. We cannot tell you what to claim,
        save, or spend.
      </p>
    </TrustPageShell>
  );
}
