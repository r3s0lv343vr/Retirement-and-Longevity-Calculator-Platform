import { TrustPageShell } from "@/components/TrustPageShell";
import { HUB_TITLE } from "@/lib/brand";
import { trustMetadata } from "@/lib/trust";
import type { Metadata } from "next";

export const metadata: Metadata = trustMetadata("/disclaimer");

export default function DisclaimerPage() {
  return (
    <TrustPageShell path="/disclaimer">
      <p className="font-serif text-xl leading-snug text-ink sm:text-2xl">
        {HUB_TITLE} is an educational projection. It is not a financial planner.
      </p>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-muted sm:text-lg">
        <p>
          The outlooks are deterministic models of the numbers you enter. They are not forecasts of markets, taxes,
          Social Security, health, or policy. They are not tax, investment, or medical advice.
        </p>
        <p>
          This cluster does not replace a Certified Financial Planner or other licensed advisor. Use a run as a first
          look, then compare it with an advisor before you make decisions.
        </p>
        <p>
          Markets, inflation, health, and the rules around benefits can all move against any model on this site.
        </p>
      </div>
    </TrustPageShell>
  );
}
