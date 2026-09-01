"use client";

import { AdSlot } from "@/components/AdSlot";
import type { GoalInput } from "@/lib/goal/defaults";
import { mergeGoalInput } from "@/lib/goal/estimateGoal";
import type { FormEvent } from "react";

type Props = {
  values: GoalInput;
  onChange: (next: GoalInput) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
};

type FieldKind = "money" | "years" | "percent";

const GOAL_FIELDS: { key: Exclude<keyof GoalInput, "goalName">; label: string; hint: string; kind: FieldKind }[] = [
  { key: "goalAmountToday", label: "What the goal costs", hint: "Today’s dollars. Any goal — house, car, buffer, something else.", kind: "money" },
  { key: "yearsToGoal", label: "Years until you need it", hint: "When the earmarked pot has to be enough.", kind: "years" },
  { key: "goalSavings", label: "In this pot now", hint: "Only savings already marked for this goal.", kind: "money" },
  { key: "plannedAnnualToGoal", label: "Yearly add to this pot", hint: "What you mean to put in, if cash flow allows.", kind: "money" },
];

const CASH_FIELDS: { key: Exclude<keyof GoalInput, "goalName">; label: string; hint: string; kind: FieldKind }[] = [
  { key: "annualIncome", label: "Yearly income", hint: "Take-home you can use for living and this goal.", kind: "money" },
  { key: "annualExpenses", label: "Yearly competing expenses", hint: "Living costs that get paid before the goal.", kind: "money" },
  { key: "otherSavings", label: "Emergency / other savings", hint: "Raided first. The goal pot is last.", kind: "money" },
];

const RATE_FIELDS: { key: Exclude<keyof GoalInput, "goalName">; label: string; hint: string; kind: FieldKind }[] = [
  { key: "inflationRate", label: "Inflation", hint: "Applied to the goal amount, income, and expenses.", kind: "percent" },
  { key: "goalReturn", label: "Return on the goal pot", hint: "Growth on the earmarked savings.", kind: "percent" },
  { key: "otherReturn", label: "Return on other savings", hint: "Usually lower if this is cash or an emergency pot.", kind: "percent" },
];

function displayValue(value: number, kind: FieldKind): string {
  const n = Number.isFinite(value) ? value : 0;
  if (kind === "percent") return String(Number((n * 100).toFixed(4)));
  if (Number.isInteger(n)) return String(n);
  return String(Number(n.toFixed(2)));
}

export function GoalForm({ values, onChange, onSubmit, loading, error }: Props) {
  const setField = (key: Exclude<keyof GoalInput, "goalName">, raw: string, kind: FieldKind) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    const stored = kind === "percent" ? n / 100 : n;
    onChange(mergeGoalInput({ ...values, [key]: stored }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="card">
        <h2 className="font-serif text-xl leading-tight text-pine">The goal pot</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          One earmarked pot. The name is optional. The math is the same for any goal.
        </p>
        <label htmlFor="goal-goalName" className="mt-5 flex min-w-0 flex-col gap-1.5">
          <span>
            <span className="block text-sm font-medium leading-snug text-ink">What you call it</span>
            <span className="mt-0.5 block text-xs leading-snug text-muted">Optional. House deposit, car, trip, or leave blank.</span>
          </span>
          <input
            id="goal-goalName"
            name="goalName"
            type="text"
            maxLength={80}
            value={values.goalName}
            onChange={(e) => onChange(mergeGoalInput({ ...values, goalName: e.target.value }))}
            className="h-11 w-full min-w-0 rounded-lg border border-pine/15 bg-paper px-3 text-ink outline-none ring-gold/40 focus:ring-2"
          />
        </label>
        <div className="mt-5 grid items-end gap-x-6 gap-y-6 sm:grid-cols-2">
          {GOAL_FIELDS.map((field) => (
            <GoalField key={field.key} field={field} values={values} onChange={setField} />
          ))}
        </div>
      </section>

      <AdSlot placement="form-break-1" />

      <section className="card">
        <h2 className="font-serif text-xl leading-tight text-pine">Competing cash flow</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          If expenses leave no surplus, the model skips the planned add and dips emergency/other savings, then this pot.
        </p>
        <div className="mt-5 grid items-end gap-x-6 gap-y-6 sm:grid-cols-2">
          {CASH_FIELDS.map((field) => (
            <GoalField key={field.key} field={field} values={values} onChange={setField} wide={field.key === "otherSavings"} />
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
        <p className="mt-3 text-sm leading-relaxed text-muted">Income and expenses inflate together. The two pots can earn different returns.</p>
        <div className="mt-4 grid gap-x-5 gap-y-5 sm:grid-cols-2">
          {RATE_FIELDS.map((field) => (
            <GoalField key={field.key} field={field} values={values} onChange={setField} />
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
        {loading ? "Checking the pot…" : "See if the goal survives"}
      </button>
    </form>
  );
}

function GoalField({
  field,
  values,
  onChange,
  wide = false,
}: {
  field: { key: Exclude<keyof GoalInput, "goalName">; label: string; hint: string; kind: FieldKind };
  values: GoalInput;
  onChange: (key: Exclude<keyof GoalInput, "goalName">, raw: string, kind: FieldKind) => void;
  wide?: boolean;
}) {
  const id = `goal-${field.key}`;
  const numeric = values[field.key];
  const step = field.kind === "percent" ? "0.1" : field.kind === "years" ? "1" : "100";

  return (
    <label htmlFor={id} className={`flex min-w-0 flex-col gap-1.5 ${wide ? "sm:col-span-full" : ""}`}>
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
