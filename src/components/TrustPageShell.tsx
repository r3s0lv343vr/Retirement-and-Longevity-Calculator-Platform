import { ClusterNav } from "@/components/ClusterNav";
import { JsonLd } from "@/components/JsonLd";
import { TrustFooterLinks } from "@/components/TrustFooterLinks";
import { HUB_TITLE } from "@/lib/brand";
import type { TrustPath } from "@/lib/trust";
import { TRUST_PAGES } from "@/lib/trust";
import type { ReactNode } from "react";

export function TrustPageShell({
  path,
  jsonLd,
  children,
}: {
  path: TrustPath;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  children: ReactNode;
}) {
  const page = TRUST_PAGES[path];
  return (
    <div className="paper-rule min-h-screen">
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <ClusterNav current={path} />
      <header className="border-b border-pine/10 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">{HUB_TITLE}</p>
          <h1 className="mt-2 max-w-3xl font-serif text-3xl leading-tight text-pine sm:text-4xl">{page.name}</h1>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 pb-16 pt-8 sm:px-6">{children}</main>
      <footer className="border-t border-pine/10 bg-pine text-paper">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
          <p className="font-serif text-xl leading-snug">{HUB_TITLE}</p>
          <TrustFooterLinks />
        </div>
      </footer>
    </div>
  );
}
