import Link from "next/link";

export function MockupBanner() {
  return (
    <p className="border-b border-gold/40 bg-gold/15 px-4 py-2 text-center text-xs leading-relaxed text-ink sm:text-sm">
      Day 1 family-finance positioning mockup. Vercel preview only — not on runaway.finance.{" "}
      <Link href="/mockup" className="font-medium text-pine underline decoration-pine/30 underline-offset-2">
        Read the feasibility notes
      </Link>
    </p>
  );
}
