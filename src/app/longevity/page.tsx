import { AdSlot } from "@/components/AdSlot";
import { CalculatorApp } from "@/components/CalculatorApp";
import { ClusterNav } from "@/components/ClusterNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How Long Before I Go Broke Calculator",
  description:
    "Retirement and Longevity Calculator. Find out if your savings will last while accounting for healthcare inflation, lifestyle phases, and part-time work.",
};

export default function LongevityPage() {
  return (
    <div className="paper-rule min-h-screen">
      <ClusterNav current="/longevity" />
      <header className="border-b border-pine/10 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
          <h1 className="max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">
            How Long Before I Go Broke Calculator
          </h1>
          <p className="mt-2 text-base text-muted sm:text-lg">Retirement and Longevity Calculator</p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-4 sm:px-6">
        <AdSlot placement="header-leaderboard" />
      </div>

      <main className="mx-auto max-w-5xl px-5 pb-16 sm:px-6">
        <section className="max-w-3xl pb-8 pt-2">
          <p className="font-serif text-xl leading-snug text-ink sm:text-2xl">
            A longevity outlook — not a flat withdrawal rate.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Healthcare inflates faster than groceries. Travel peaks, then slows. Many people keep a side hustle for a
            few years after they “retire.” This calculator folds those curves into one Retirement Longevity Outlook.
          </p>
        </section>

        <CalculatorApp />
      </main>

      <footer className="border-t border-pine/10 bg-pine text-paper">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
          <AdSlot placement="footer" className="mb-4 border-paper/20 bg-paper/10 text-paper/80" />
          <AdSlot placement="footer-2" className="mb-6 border-paper/20 bg-paper/10 text-paper/80" />
          <p className="font-serif text-xl leading-snug">How Long Before I Go Broke Calculator</p>
          <p className="mt-1 text-sm text-paper/80">Retirement and Longevity Calculator</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-paper/75">
            Educational projection only. It is not tax, investment, or medical advice. Markets, inflation, health, and
            policy can all move against any model. Compare this outlook with a licensed advisor before making decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
