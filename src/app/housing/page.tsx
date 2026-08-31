import { AdSlot } from "@/components/AdSlot";
import { ClusterNav } from "@/components/ClusterNav";
import { HousingApp } from "@/components/HousingApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stay Home vs CCRC vs Nursing",
  description:
    "Compare staying home, a continuing-care community, and a nursing home as three exclusive later-life housing paths. Not extra cells on the longevity form.",
};

export default function HousingPage() {
  return (
    <div className="paper-rule min-h-screen">
      <ClusterNav current="/housing" />
      <header className="border-b border-pine/10 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
          <h1 className="max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">
            Stay Home vs CCRC vs Nursing
          </h1>
          <p className="mt-2 text-base text-muted sm:text-lg">Later-life housing as a compare, not six more cells</p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-4 sm:px-6">
        <AdSlot placement="header-leaderboard" />
      </div>

      <main className="mx-auto max-w-5xl px-5 pb-16 sm:px-6">
        <section className="max-w-3xl pb-8 pt-2">
          <p className="font-serif text-xl leading-snug text-ink sm:text-2xl">
            Three exclusive paths. One question: which later-life housing lasts.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            How long can already stack senior rental, nursing, and CCRC on one outlook. This page does not add cells
            there. It runs stay home, CCRC, and nursing as three separate plans with the same savings and spending.
          </p>
        </section>
        <HousingApp />
      </main>

      <footer className="border-t border-pine/10 bg-pine text-paper">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
          <AdSlot placement="footer" className="mb-4 border-paper/20 bg-paper/10 text-paper/80" />
          <AdSlot placement="footer-2" className="mb-6 border-paper/20 bg-paper/10 text-paper/80" />
          <p className="font-serif text-xl leading-snug">Stay Home vs CCRC vs Nursing</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-paper/75">
            Educational projection only. It is not tax, investment, or medical advice. Markets, inflation, health, and
            policy can all move against any model. Compare this outlook with a licensed advisor before making decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
