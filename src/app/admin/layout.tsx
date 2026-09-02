import type { Metadata } from "next";
import { HUB_TITLE } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Site admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="paper-rule min-h-screen">
      <header className="border-b border-pine/20 bg-pine text-paper">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <p className="font-serif text-lg leading-snug sm:text-xl">Site admin</p>
          <p className="text-base text-paper/80 sm:text-lg">{HUB_TITLE}</p>
        </div>
      </header>
      {children}
    </div>
  );
}
