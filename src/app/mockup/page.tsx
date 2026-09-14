import { ClusterNav } from "@/components/ClusterNav";
import { TrustFooterLinks } from "@/components/TrustFooterLinks";
import { HUB_TITLE } from "@/lib/brand";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Day 1 mockup notes – Family finance repositioning",
  description: "Feasibility notes for the Day 1 family-finance positioning mockup. Not a live page.",
  robots: { index: false, follow: false },
};

export default function MockupNotesPage() {
  return (
    <div className="paper-rule min-h-screen">
      <ClusterNav current="/mockup" />
      <header className="border-b border-pine/10 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Reviewer notes</p>
          <h1 className="mt-2 max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">
            Day 1 mockup — feasibility, not a ship
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 pb-16 pt-8 sm:px-6 space-y-6 text-base leading-relaxed text-muted sm:text-lg">
        <p className="font-serif text-xl leading-snug text-ink sm:text-2xl">
          This preview is architecture and copy only. Calculator engines, names, and URLs are unchanged. Do not merge
          to main until you say to ship.
        </p>
        <p>
          <Link href="/" className="font-medium text-pine underline decoration-pine/30 underline-offset-2">
            Open the mocked homepage
          </Link>
        </p>
      </main>
      <footer className="border-t border-pine/10 bg-pine text-paper">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
          <p className="font-serif text-xl leading-snug">{HUB_TITLE}</p>
          <TrustFooterLinks />
        </div>
      </footer>
    </div>
  );
}
