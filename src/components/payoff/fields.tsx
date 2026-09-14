"use client";

import type { ReactNode } from "react";

type FieldKind = "money" | "years" | "percent" | "month" | "number";

export function displayValue(value: number, kind: FieldKind): string {
  const n = Number.isFinite(value) ? value : 0;
  if (kind === "percent") return String(Number((n * 100).toFixed(4)));
  if (Number.isInteger(n)) return String(n);
  return String(Number(n.toFixed(2)));
}

export function PayoffField({
  id,
  label,
  hint,
  kind,
  value,
  onChange,
  min,
  max,
  step,
}: {
  id: string;
  label: string;
  hint?: string;
  kind: FieldKind;
  value: number;
  onChange: (raw: string) => void;
  min?: number;
  max?: number;
  step?: string;
}) {
  const resolvedStep = step ?? (kind === "percent" ? "0.01" : kind === "years" || kind === "month" ? "1" : "50");
  return (
    <label htmlFor={id} className="flex min-w-0 flex-col gap-1.5">
      <span>
        <span className="block text-sm font-medium leading-snug text-ink">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs leading-snug text-muted">{hint}</span> : null}
      </span>
      <div className="relative">
        <input
          id={id}
          name={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={resolvedStep}
          value={displayValue(value, kind)}
          onChange={(event) => onChange(event.target.value)}
          className={`h-11 w-full min-w-0 rounded-lg border border-pine/15 bg-paper px-3 text-ink outline-none ring-gold/40 focus:ring-2 ${
            kind === "percent" ? "pr-12" : "pr-3"
          }`}
        />
        {kind === "percent" ? (
          <span className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-sm text-muted">%</span>
        ) : null}
      </div>
    </label>
  );
}

export function DetailsCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="card group">
      <summary className="cursor-pointer list-none font-serif text-xl leading-tight text-pine marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block text-xs font-sans transition group-open:rotate-90">▶</span>
          {title}
        </span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}
