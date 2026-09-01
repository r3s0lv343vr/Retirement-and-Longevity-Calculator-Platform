"use client";

import { AdSlot } from "@/components/AdSlot";
import type { ChildInput } from "@/lib/child/defaults";
import { mergeChildInput } from "@/lib/child/estimateChild";
import type { FormEvent } from "react";

type Props = {
  values: ChildInput;
  onChange: (next: ChildInput) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
};

type FieldKind = "age" | "money" | "years" | "percent";

const RAISING_FIELDS: { key: keyof ChildInput; label: string; hint: string; kind: FieldKind }[] = [
  { key: "childAge", label: "Child’s age now", hint: "0 if the baby is on the way or just born.", kind: "age" },
  { key: "schoolStartAge", label: "School starts at age", hint: "School and co-curricular costs begin here.", kind: "age" },
  { key: "schoolAnnualToday", label: "School cost / year", hint: "Today’s dollars. Tuition, fees, or the extra cost of the school you mean.", kind: "money" },
  { key: "extraAnnualToday", label: "Co-curricular / year", hint: "Sports, music, clubs, and the extras around school.", kind: "money" },
  { key: "raisingSavings", label: "Already saved for raising", hint: "Only the pot earmarked through age 18.", kind: "money" },
  { key: "raisingAnnualSave", label: "Yearly add to that pot", hint: "Until university starts.", kind: "money" },
];

const UNIVERSITY_FIELDS: { key: keyof ChildInput; label: string; hint: string; kind: FieldKind }[] = [
  { key: "universityStartAge", label: "University starts at age", hint: "Raising costs stop the year before this.", kind: "age" },
  { key: "universityYears", label: "Years of university", hint: "Usually 4.", kind: "years" },
  { key: "universityAnnualToday", label: "University cost / year", hint: "Today’s dollars. Tuition and living so they can enter smoothly.", kind: "money" },
  { key: "universitySavings", label: "Already saved for university", hint: "A separate pot from raising.", kind: "money" },
  { key: "universityAnnualSave", label: "Yearly add to that pot", hint: "Until university starts.", kind: "money" },
];

const RATE_FIELDS: { key: keyof ChildInput; label: string; hint: string; kind: FieldKind }[] = [
  { key: "inflationRate", label: "Inflation", hint: "Applied to school, extras, and university costs.", kind: "percent" },
  { key: "returnRate", label: "Return on these pots", hint: "Same rate on both nest eggs.", kind: "percent" },
];

function displayValue(value: number, kind: FieldKind): string {
  const n = Number.isFinite(value) ? value : 0;
  if (kind === "percent") return String(Number((n * 100).toFixed(4)));
  if (Number.isInteger(n)) return String(n);
  return String(Number(n.toFixed(2)));
}

export function ChildForm({ values, onChange, onSubmit, loading, error }: Props) {
  const setField = (key: keyof ChildInput, raw: string, kind: FieldKind) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    const stored = kind === "percent" ? n / 100 : n;
    onChange(mergeChildInput({ ...values, [key]: stored }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="card">
        <h2 className="font-serif text-xl leading-tight text-pine">Through 18</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          School and co-curricular until university starts. This pot does not pay for university.
        </p>
        <div className="mt-5 grid items-end gap-x-6 gap-y-6 sm:grid-cols-2">
          {RAISING_FIELDS.map((field) => (
            <ChildField key={field.key} field={field} values={values} onChange={setField} />
          ))}
        </div>
      </section>

      <AdSlot placement="form-break-1" />

      <section className="card">
        <h2 className="font-serif text-xl leading-tight text-pine">University</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          A second nest egg so they can enter university without raiding the raising pot.
        </p>
        <div className="mt-5 grid items-end gap-x-6 gap-y-6 sm:grid-cols-2">
          {UNIVERSITY_FIELDS.map((field) => (
            <ChildField key={field.key} field={field} values={values} onChange={setField} />
          ))}
        </div>
      </section>

      <details className="card group">
        <summary className="cursor-pointer list-none font-medium text-pine marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block text-xs transition group-open:rotate-90">▶</span>
            Rates
          </span>
        </summary>
        <p className="mt-3 text-sm leading-relaxed text-muted">Education costs often rise faster than general prices.</p>
        <div className="mt-4 grid gap-x-5 gap-y-5 sm:grid-cols-2">
          {RATE_FIELDS.map((field) => (
            <ChildField key={field.key} field={field} values={values} onChange={setField} />
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
        {loading ? "Estimating nest eggs…" : "See the two nest eggs"}
      </button>
    </form>
  );
}

function ChildField({
  field,
  values,
  onChange,
}: {
  field: { key: keyof ChildInput; label: string; hint: string; kind: FieldKind };
  values: ChildInput;
  onChange: (key: keyof ChildInput, raw: string, kind: FieldKind) => void;
}) {
  const id = `child-${field.key}`;
  const numeric = values[field.key] as number;
  const step = field.kind === "percent" ? "0.1" : field.kind === "age" || field.kind === "years" ? "1" : "100";

  return (
    <label htmlFor={id} className="flex min-w-0 flex-col gap-1.5">
      <span>
        <span className="block text-sm font-medium leading-snug text-ink">{field.label}</span>
        <span className="mt-0.5 block text-xs leading-snug text-muted">{field.hint}</span>
      </span>
      <div className="relative">
        <input
          id={id}
          name={field.key}
          type="number"
          inputMode="decimal"
          step={step}
          value={displayValue(numeric, field.kind)}
          onChange={(e) => onChange(field.key, e.target.value, field.kind)}
          className={`h-11 w-full min-w-0 rounded-lg border border-pine/15 bg-paper px-3 text-ink outline-none ring-gold/40 focus:ring-2 ${field.kind === "percent" ? "pr-12" : "pr-3"}`}
        />
        {field.kind === "percent" ? (
          <span className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-sm text-muted">%</span>
        ) : null}
      </div>
    </label>
  );
}
