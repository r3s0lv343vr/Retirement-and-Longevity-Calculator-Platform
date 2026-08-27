"use client";

import { FIELD_META } from "@/lib/engine";
import type { CalculatorInput } from "@/lib/engine";
import type { FormEvent } from "react";

type Props = {
  values: CalculatorInput;
  onChange: (next: CalculatorInput) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
};

const GROUPS: { id: string; title: string; blurb: string; keys: (keyof CalculatorInput)[]; advanced?: boolean }[] = [
  {
    id: "timeline",
    title: "Your timeline",
    blurb: "When work tapers off, and how long you want the money to last.",
    keys: ["currentAge", "retirementAge", "planToAge"],
  },
  {
    id: "savings",
    title: "Nest egg",
    blurb: "Balances and savings in today’s dollars.",
    keys: ["currentSavings", "annualContribution"],
  },
  {
    id: "work",
    title: "Phased work",
    blurb: "Part-time or side-hustle income after full-time work ends.",
    keys: ["partTimeAnnualIncome", "partTimeStartAge", "partTimeEndAge"],
  },
  {
    id: "income",
    title: "Guaranteed income",
    blurb: "Social Security and any pension, inflated with general prices.",
    keys: ["socialSecurityAnnual", "socialSecurityStartAge", "pensionAnnual", "pensionStartAge"],
  },
  {
    id: "spending",
    title: "Spending today",
    blurb: "Lifestyle and health are tracked separately so medical inflation can outrun the CPI.",
    keys: ["lifestyleSpendToday", "healthcareSpendToday", "longTermCareAnnual", "longTermCareStartAge"],
  },
  {
    id: "assumptions",
    title: "Market & inflation",
    blurb: "Nominal annual rates.",
    keys: ["inflationRate", "healthcareInflationRate", "preRetirementReturn", "postRetirementReturn"],
    advanced: true,
  },
  {
    id: "phases",
    title: "Lifestyle phases",
    blurb: "Go-go, slow-go, and no-go years. Factors scale lifestyle spending only.",
    keys: [
      "goGoEndAge",
      "slowGoEndAge",
      "goGoLifestyleMultiplier",
      "slowGoLifestyleMultiplier",
      "noGoLifestyleMultiplier",
    ],
    advanced: true,
  },
];

function displayValue(key: keyof CalculatorInput, value: number, kind: string): string {
  if (kind === "percent") return (value * 100).toString();
  if (Number.isInteger(value)) return String(value);
  return String(value);
}

export function CalculatorForm({ values, onChange, onSubmit, loading, error }: Props) {
  const setField = (key: keyof CalculatorInput, raw: string, kind: string) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    const stored = kind === "percent" ? n / 100 : n;
    onChange({ ...values, [key]: stored });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {GROUPS.filter((g) => !g.advanced).map((group) => (
        <fieldset key={group.id} className="rounded-xl border border-pine/10 bg-white/70 p-4 shadow-sm sm:p-5">
          <legend className="px-1 font-serif text-lg text-pine">{group.title}</legend>
          <p className="mb-4 text-sm text-muted">{group.blurb}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {group.keys.map((key) => (
              <Field key={key} fieldKey={key} values={values} onChange={setField} />
            ))}
          </div>
        </fieldset>
      ))}

      <details className="rounded-xl border border-pine/10 bg-white/50 p-4">
        <summary className="cursor-pointer font-medium text-pine">Advanced assumptions</summary>
        <p className="mt-2 text-sm text-muted">Change these if you have a specific plan. Defaults are conservative US planning figures.</p>
        {GROUPS.filter((g) => g.advanced).map((group) => (
          <div key={group.id} className="mt-4">
            <h3 className="font-serif text-base text-pine">{group.title}</h3>
            <p className="mb-3 text-sm text-muted">{group.blurb}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.keys.map((key) => (
                <Field key={key} fieldKey={key} values={values} onChange={setField} />
              ))}
            </div>
          </div>
        ))}
      </details>

      {error ? (
        <p className="rounded-md border border-short/30 bg-short/10 px-3 py-2 text-sm text-short" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-pine px-6 py-3 text-sm font-semibold text-paper shadow-sm transition hover:bg-pine-2 disabled:opacity-60"
      >
        {loading ? "Running projection…" : "See longevity outlook"}
      </button>
    </form>
  );
}

function Field({
  fieldKey,
  values,
  onChange,
}: {
  fieldKey: keyof CalculatorInput;
  values: CalculatorInput;
  onChange: (key: keyof CalculatorInput, raw: string, kind: string) => void;
}) {
  const meta = FIELD_META[fieldKey];
  const id = `field-${fieldKey}`;
  const step = meta.kind === "percent" || meta.kind === "multiplier" ? "0.1" : meta.kind === "age" ? "1" : "100";

  return (
    <label htmlFor={id} className="block">
      <span className="block text-sm font-medium text-ink">{meta.label}</span>
      {meta.hint ? <span className="block text-xs text-muted">{meta.hint}</span> : null}
      <input
        id={id}
        name={fieldKey}
        type="number"
        inputMode="decimal"
        step={step}
        value={displayValue(fieldKey, values[fieldKey], meta.kind)}
        onChange={(e) => onChange(fieldKey, e.target.value, meta.kind)}
        className="mt-1 w-full rounded-lg border border-pine/15 bg-paper px-3 py-2 text-ink outline-none ring-gold/40 focus:ring-2"
      />
    </label>
  );
}
