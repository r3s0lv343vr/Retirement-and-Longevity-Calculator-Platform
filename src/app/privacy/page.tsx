import { TrustPageShell } from "@/components/TrustPageShell";
import { BUILDER_NAME, CONTACT_EMAIL, HUB_TITLE } from "@/lib/brand";
import { trustMetadata } from "@/lib/trust";
import type { Metadata } from "next";

export const metadata: Metadata = trustMetadata("/privacy");

export default function PrivacyPage() {
  return (
    <TrustPageShell path="/privacy">
      <p className="font-serif text-xl leading-snug text-ink sm:text-2xl">
        {HUB_TITLE} does not store the savings, ages, or other plan numbers you type into a calculator.
      </p>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-muted sm:text-lg">
        <p>
          A small visitor cookie (<code className="text-ink">ns_vid</code>) remembers this browser so the site can count
          unique visitors and calculator runs. Those counts show on the private /admin page. They are not sold.
        </p>
        <p>
          Calculator runs send your entries to the server only to compute the outlook. The numbers are not saved with
          the visitor id.
        </p>
        <p>
          If Google AdSense is attached, Google and its partners may use cookies to serve and measure ads. You can opt
          out of personalized ads in{" "}
          <a
            className="text-pine underline decoration-pine/30 underline-offset-2"
            href="https://adssettings.google.com"
            rel="noreferrer"
          >
            Google Ads Settings
          </a>{" "}
          and at{" "}
          <a className="text-pine underline decoration-pine/30 underline-offset-2" href="https://www.aboutads.info" rel="noreferrer">
            aboutads.info
          </a>
          .
        </p>
        <p>
          {BUILDER_NAME} operates this site. Questions:{" "}
          <a className="font-medium text-pine underline decoration-pine/30 underline-offset-2" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>
    </TrustPageShell>
  );
}
