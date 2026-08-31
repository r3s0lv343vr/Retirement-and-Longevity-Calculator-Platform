import { AdSlot } from "@/components/AdSlot";
import { ClaimApp } from "@/components/ClaimApp";
import { ClusterNav } from "@/components/ClusterNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claim Social Security at 67 vs 70",
  description:
    "One short run: compare claiming Social Security at 67 versus 70. Same delayed-credit math as the How long compare card.",
};

export default function ClaimPage() {
  return (
    <div className="paper-rule min-h-screen">
      <ClusterNav current="/claim" />
      <header className="border-b border-pine/10 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
          <h1 className="max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">
            Claim Social Security at 67 vs 70
          </h1>
          <p className="mt-2 text-base text-muted sm:text-lg">One question. One short run.</p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-4 sm:px-6">
        <AdSlot placement="header-leaderboard" />
      </div>

      <main className="mx-auto max-w-5xl px-5 pb-16 sm:px-6">
        <section className="max-w-3xl pb-8 pt-2">
          <p className="font-serif text-xl leading-snug text-ink sm:text-2xl">
            Delay the check three years, or take it at full retirement age.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            The How long calculator still has this compare on the outlook. This page is for people who only want that
            question. Same engine, same delayed-retirement credits: 67 is full retirement age, 70 is 24% higher.
          </p>
        </section>
        <ClaimApp />
      </main>

      <footer className="border-t border-pine/10 bg-pine text-paper">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
          <AdSlot placement="footer" className="mb-4 border-paper/20 bg-paper/10 text-paper/80" />
          <AdSlot placement="footer-2" className="mb-6 border-paper/20 bg-paper/10 text-paper/80" />
          <p className="font-serif text-xl leading-snug">Claim Social Security at 67 vs 70</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-paper/75">
            Educational projection only. It is not tax, investment, or medical advice. Markets, inflation, health, and
            policy can all move against any model. Compare this outlook with a licensed advisor before making decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
