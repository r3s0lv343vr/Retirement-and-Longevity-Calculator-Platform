import { AdSlot } from "@/components/AdSlot";
import { CalculatorApp } from "@/components/CalculatorApp";

export default function HomePage() {
  return (
    <div className="paper-rule min-h-screen">
      <header className="border-b border-pine/10 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-baseline justify-between px-4 py-5 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">Retirement calculator</p>
            <h1 className="font-serif text-3xl text-pine sm:text-4xl">Nestspan</h1>
          </div>
          <p className="hidden max-w-xs text-right text-sm text-muted sm:block">
            Will the nest egg last as long as you will?
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <AdSlot placement="header-leaderboard" className="py-3" />
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <section className="mx-auto max-w-3xl pb-10 pt-4 text-center">
          <p className="font-serif text-2xl leading-snug text-ink sm:text-3xl">
            A longevity outlook — not a flat withdrawal rate.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Healthcare inflates faster than groceries. Travel peaks, then slows. Many people keep a side hustle for a
            few years after they “retire.” Nestspan folds those curves into one Retirement Longevity Outlook.
          </p>
        </section>

        <CalculatorApp />
      </main>

      <footer className="border-t border-pine/10 bg-pine text-paper">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <AdSlot placement="footer" className="mb-6 border-paper/20 bg-paper/10 py-4 text-paper/80" />
          <p className="font-serif text-xl">Nestspan</p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-paper/75">
            Educational projection only. It is not tax, investment, or medical advice. Markets, inflation, health, and
            policy can all move against any model. Compare this outlook with a licensed advisor before making decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
