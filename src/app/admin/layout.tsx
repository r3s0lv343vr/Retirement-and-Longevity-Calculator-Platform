import type { Metadata } from "next";
import { HUB_TITLE } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Site admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="paper-rule min-h-screen">
      <header className="border-b border-pine/10 bg-pine text-paper">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 sm:px-6">
          <p className="text-sm font-semibold tracking-wide">Site admin</p>
          <p className="text-xs text-paper/70">{HUB_TITLE}</p>
        </div>
      </header>
      {children}
    </div>
  );
}
