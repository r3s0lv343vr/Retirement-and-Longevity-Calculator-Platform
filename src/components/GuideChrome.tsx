import type { ReactNode } from "react";
import { AdSlot } from "@/components/AdSlot";
import { ClusterNav } from "@/components/ClusterNav";
import { JsonLd } from "@/components/JsonLd";
import { TrustFooterLinks } from "@/components/TrustFooterLinks";
import { HUB_TITLE } from "@/lib/brand";

export function GuideChrome({
  current,
  jsonLd,
  header,
  children,
  footerTitle = HUB_TITLE,
}: {
  current: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  header: ReactNode;
  children: ReactNode;
  footerTitle?: string;
}) {
  return (
    <div className="paper-rule min-h-screen">
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <ClusterNav current={current} />
      <header className="border-b border-pine/10 bg-white/80 backdrop-blur">{header}</header>
      <AdSlot placement="header-leaderboard" className="mx-auto max-w-5xl px-5 py-4 sm:px-6" />
      <main className="mx-auto max-w-5xl px-5 pb-16 pt-4 sm:px-6">{children}</main>
      <footer className="border-t border-pine/10 bg-pine text-paper">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6">
          <AdSlot placement="footer" className="mb-4 border-paper/20 bg-paper/10 text-paper/80" />
          <AdSlot placement="footer-2" className="mb-6 border-paper/20 bg-paper/10 text-paper/80" />
          <p className="font-serif text-xl leading-snug">{footerTitle}</p>
          <TrustFooterLinks />
        </div>
      </footer>
    </div>
  );
}

export function GuideCta({ children }: { children: ReactNode }) {
  return (
    <aside className="my-8 rounded-2xl border border-pine/15 bg-white p-5 sm:p-6">
      <div className="max-w-3xl space-y-3 text-base leading-relaxed text-ink">{children}</div>
    </aside>
  );
}

export function GuideFormula({ children }: { children: ReactNode }) {
  return (
    <p className="my-5 rounded-xl border border-pine/15 bg-white px-4 py-3 font-medium leading-relaxed text-ink">
      {children}
    </p>
  );
}

export function GuideTable({
  caption,
  headers,
  rows,
  emphasizeLastRow = false,
}: {
  caption: string;
  headers: string[];
  rows: string[][];
  emphasizeLastRow?: boolean;
}) {
  return (
    <div className="guide-table-wrap my-6">
      <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
        <caption className="mb-2 text-left text-sm font-medium text-ink">{caption}</caption>
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="border-b border-pine/20 bg-white px-3 py-2 font-semibold text-pine"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const strong = emphasizeLastRow && index === rows.length - 1;
            return (
              <tr key={row.join("|")}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${index}-${cellIndex}`}
                    className={`border-b border-pine/10 bg-white px-3 py-2 text-ink ${strong ? "font-medium" : ""}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
