import { AdSlot } from "@/components/AdSlot";
import { ClusterNav } from "@/components/ClusterNav";
import { GoalApp } from "@/components/GoalApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Will the Goal Survive",
  description:
    "See whether competing expenses force a dip into savings earmarked for a goal, and whether that pot is compromised or dissolved before you get there.",
};

export default function GoalPage() {
  return (
    <div className="paper-rule min-h-screen">
      <ClusterNav current="/goal" />
      <header className="border-b border-pine/10 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
          <h1 className="max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">Will the Goal Survive</h1>
          <p className="mt-2 text-base text-muted sm:text-lg">
            Competing expenses vs the pot you marked for one goal
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-4 sm:px-6">
        <AdSlot placement="header-leaderboard" />
      </div>

      <main className="mx-auto max-w-5xl px-5 pb-16 sm:px-6">
        <section className="max-w-3xl pb-8 pt-2">
          <p className="font-serif text-xl leading-snug text-ink sm:text-2xl">
            Any goal. One question: do living costs raid the savings you set aside for it?
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Emergency and other savings are dipped first. The earmarked pot is last. If expenses keep overflowing, that
            pot can be compromised or dissolved so the goal is never reached.
          </p>
        </section>
        <GoalApp />
      </main>

      <footer className="border-t border-pine/10 bg-pine text-paper">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
          <AdSlot placement="footer" className="mb-4 border-paper/20 bg-paper/10 text-paper/80" />
          <AdSlot placement="footer-2" className="mb-6 border-paper/20 bg-paper/10 text-paper/80" />
          <p className="font-serif text-xl leading-snug">Will the Goal Survive</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-paper/75">
            Educational projection only. It is not tax, investment, or medical advice. Markets, inflation, health, and
            policy can all move against any model. Compare this outlook with a licensed advisor before making decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
