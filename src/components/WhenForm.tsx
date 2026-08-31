"use client";

import { AdSlot } from "@/components/AdSlot";
import { FIELD_META, mergeInput } from "@/lib/engine";
import type { CalculatorInput } from "@/lib/engine";
import type { FormEvent } from "react";

type Props = {
  values: CalculatorInput;
  onChange: (next: CalculatorInput) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
};

const MAIN_KEYS: (keyof CalculatorInput)[] = [
  "currentAge",
  "planToAge",
  "currentSavings",
  "annualContribution",
  "lifestyleSpendToday",
  "healthcareSpendToday",
  "socialSecurityAnnual",
  "socialSecurityStartAge",
  "pensionAnnual",
  "pensionStartAge",
  "pensionCola",
];

const ADVANCED_KEYS: (keyof CalculatorInput)[] = [
  "inflationRate",
  "healthcareInflationRate",
  "preRetirementReturn",
  "postRetirementReturn",
];

function displayValue(value: number, kind: string): string {
  const n = Number.isFinite(value) ? value : 0;
  if (kind === "percent") return String(Number((n * 100).toFixed(4)));
  if (kind === "multiplier") return String(Number(n.toFixed(4)));
  if (Number.isInteger(n)) return String(n);
  return String(Number(n.toFixed(2)));
}

export function WhenForm({ values, onChange, onSubmit, loading, error }: Props) {
  const setField = (key: keyof CalculatorInput, raw: string, kind: string) => {
    if (kind === "toggle") {
      onChange(mergeInput({ ...values, [key]: raw === "true" }));
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    const stored = kind === "percent" ? n / 100 : n;
    onChange(mergeInput({ ...values, [key]: stored }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="card">
        <h2 className="font-serif text-xl leading-tight text-pine">Your entered plan</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Ages, savings, lifestyle, healthcare, and guaranteed income. Work-end is what this tool solves for — it is
          not on this form. Pension at $0 is skipped.
        </p>
        <div className="mt-5 grid items-end gap-x-6 gap-y-6 sm:grid-cols-2">
          {MAIN_KEYS.map((key) => (
            <WhenField key={key} fieldKey={key} values={values} onChange={setField} wide={key === "pensionCola"} />
          ))}
        </div>
      </section>

      <AdSlot placement="form-break-1" />

      <details className="card group">
        <summary className="cursor-pointer list-none font-medium text-pine marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block text-xs transition group-open:rotate-90">▶</span>
            Rates
          </span>
        </summary>
        <p className="mt-3 text-sm leading-relaxed text-muted">Same market and inflation rates as the other tools.</p>
        <div className="mt-4 grid gap-x-5 gap-y-5 sm:grid-cols-2">
          {ADVANCED_KEYS.map((key) => (
            <WhenField key={key} fieldKey={key} values={values} onChange={setField} />
          ))}
        </div>
      </details>

      {error ? (
        <p className="rounded-xl border border-short/30 bg-short/10 px-4 py-3 text-sm text-short" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-pine px-6 text-sm font-semibold text-paper shadow-sm transition hover:bg-pine-2 disabled:opacity-60"
      >
        {loading ? "Finding work-end…" : "See when I can stop"}
      </button>
    </form>
  );
}

function WhenField({
  fieldKey,
  values,
  onChange,
  wide = false,
}: {
  fieldKey: keyof CalculatorInput;
  values: CalculatorInput;
  onChange: (key: keyof CalculatorInput, raw: string, kind: string) => void;
  wide?: boolean;
}) {
  const meta = FIELD_META[fieldKey];
  const id = `when-${fieldKey}`;

  if (meta.kind === "toggle") {
    const on = Boolean(values[fieldKey]);
    return (
      <div className={`flex min-w-0 flex-col gap-1.5 ${wide ? "sm:col-span-full" : ""}`}>
        <span>
          <span className="block text-sm font-medium leading-snug text-ink">{meta.label}</span>
          {meta.hint ? <span className="mt-0.5 block text-xs leading-snug text-muted">{meta.hint}</span> : null}
        </span>
        <div className="grid h-11 grid-cols-2 overflow-hidden rounded-lg border border-pine/15 bg-paper">
          <button
            type="button"
            aria-pressed={on}
            className={`text-sm font-semibold transition ${on ? "bg-pine text-paper" : "text-muted hover:bg-paper-2"}`}
            onClick={() => onChange(fieldKey, "true", "toggle")}
          >
            On
          </button>
          <button
            type="button"
            aria-pressed={!on}
            className={`text-sm font-semibold transition ${!on ? "bg-pine text-paper" : "text-muted hover:bg-paper-2"}`}
            onClick={() => onChange(fieldKey, "false", "toggle")}
          >
            Off
          </button>
        </div>
      </div>
    );
  }

  const numeric = values[fieldKey] as number;
  const step = meta.kind === "percent" || meta.kind === "multiplier" ? "0.1" : meta.kind === "age" ? "1" : "100";

  return (
    <label htmlFor={id} className={`flex min-w-0 flex-col gap-1.5 ${wide ? "sm:col-span-full" : ""}`}>
      <span>
        <span className="block text-sm font-medium leading-snug text-ink">{meta.label}</span>
        {meta.hint ? <span className="mt-0.5 block text-xs leading-snug text-muted">{meta.hint}</span> : null}
      </span>
      <div className="relative">
        <input
          id={id}
          name={fieldKey}
          type="number"
          inputMode="decimal"
          step={step}
          value={displayValue(numeric, meta.kind)}
          onChange={(e) => onChange(fieldKey, e.target.value, meta.kind)}
          className={`h-11 w-full min-w-0 rounded-lg border border-pine/15 bg-paper px-3 text-ink outline-none ring-gold/40 focus:ring-2 ${meta.kind === "percent" ? "pr-12" : "pr-3"}`}
        />
        {meta.kind === "percent" ? (
          <span className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-sm text-muted">%</span>
        ) : null}
      </div>
    </label>
  );
}
