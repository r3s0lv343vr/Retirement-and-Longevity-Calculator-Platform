import { AdSlot } from "@/components/AdSlot";
import { ClusterNav } from "@/components/ClusterNav";
import { NeedApp } from "@/components/NeedApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How Much Do I Need to Last",
  description:
    "Find the nest egg you need today so your entered retirement plan lasts through a given age. Inverse of How Long Before I Go Broke.",
};

export default function NeedPage() {
  return (
    <div className="paper-rule min-h-screen">
      <ClusterNav current="/need" />
      <header className="border-b border-pine/10 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
          <h1 className="max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">
            How Much Do I Need to Last
          </h1>
          <p className="mt-2 text-base text-muted sm:text-lg">Nest egg today so the plan lasts through a given age</p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-4 sm:px-6">
        <AdSlot placement="header-leaderboard" />
      </div>

      <main className="mx-auto max-w-5xl px-5 pb-16 sm:px-6">
        <section className="max-w-3xl pb-8 pt-2">
          <p className="font-serif text-xl leading-snug text-ink sm:text-2xl">
            The inverse of How long before I go broke.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            That tool asks how far today’s savings go. This one asks how much you need now so the same kind of plan
            lasts through the age you set. It uses your entered lifestyle and healthcare, not the comfortable-living
            floors.
          </p>
        </section>
        <NeedApp />
      </main>

      <footer className="border-t border-pine/10 bg-pine text-paper">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
          <AdSlot placement="footer" className="mb-4 border-paper/20 bg-paper/10 text-paper/80" />
          <AdSlot placement="footer-2" className="mb-6 border-paper/20 bg-paper/10 text-paper/80" />
          <p className="font-serif text-xl leading-snug">How Much Do I Need to Last</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-paper/75">
            Educational projection only. It is not tax, investment, or medical advice. Markets, inflation, health, and
            policy can all move against any model. Compare this outlook with a licensed advisor before making decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
