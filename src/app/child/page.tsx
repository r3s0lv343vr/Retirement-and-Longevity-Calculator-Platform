import { AdSlot } from "@/components/AdSlot";
import { ChildApp } from "@/components/ChildApp";
import { ClusterNav } from "@/components/ClusterNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nest Eggs for a Child",
  description:
    "Two nest eggs plus time-to-ready: living costs through 18, school and university on education inflation, and the yearly add to stay off salary.",
};

export default function ChildPage() {
  return (
    <div className="paper-rule min-h-screen">
      <ClusterNav current="/child" />
      <header className="border-b border-pine/10 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
          <h1 className="max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">
            Nest Eggs for a Child
          </h1>
          <p className="mt-2 text-base text-muted sm:text-lg">When you are ready, through 18, then university</p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-4 sm:px-6">
        <AdSlot placement="header-leaderboard" />
      </div>

      <main className="mx-auto max-w-5xl px-5 pb-16 sm:px-6">
        <section className="max-w-3xl pb-8 pt-2">
          <p className="font-serif text-xl leading-snug text-ink sm:text-2xl">
            A baby on the way, or a child already here. When you are ready, then two nest eggs.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Monthly living × 12 grows with inflation and an age-related increase through 18. That present value, invested
            at your return, is the raising annuity. School and co-curricular sit on the same pot and rise with education
            inflation. University stays a second nest egg. The outlook says if you can have the baby while school would
            still depend on salary, and what yearly add keeps each pot off salary.
          </p>
        </section>
        <ChildApp />
      </main>

      <footer className="border-t border-pine/10 bg-pine text-paper">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
          <AdSlot placement="footer" className="mb-4 border-paper/20 bg-paper/10 text-paper/80" />
          <AdSlot placement="footer-2" className="mb-6 border-paper/20 bg-paper/10 text-paper/80" />
          <p className="font-serif text-xl leading-snug">Nest Eggs for a Child</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-paper/75">
            Educational projection only. It is not tax, investment, or medical advice. Markets, inflation, health, and
            policy can all move against any model. Compare this outlook with a licensed advisor before making decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
