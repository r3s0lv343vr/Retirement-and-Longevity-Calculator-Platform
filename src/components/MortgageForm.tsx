"use client";

import { AdSlot } from "@/components/AdSlot";
import type { MortgageInput } from "@/lib/mortgage/defaults";
import { downPaymentPercent, mergeMortgageInput } from "@/lib/mortgage/estimateMortgage";
import { formatPercent } from "@/lib/format";
import type { FormEvent } from "react";

type Props = {
  values: MortgageInput;
  onChange: (next: MortgageInput) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
};

type FieldKind = "money" | "years" | "percent" | "monthly";

type Field = { key: keyof MortgageInput; label: string; hint: string; kind: FieldKind };

const HOUSE_FIELDS: Field[] = [
  { key: "homePrice", label: "Home price", hint: "Contract price, not the loan.", kind: "money" },
  { key: "downPayment", label: "Down payment", hint: "Cash at closing toward the price.", kind: "money" },
  { key: "annualRate", label: "Interest rate", hint: "Adjust this. Quoted annual rate.", kind: "percent" },
  { key: "termYears", label: "Term", hint: "Usually 15 or 30 years.", kind: "years" },
  { key: "extraMonthly", label: "Extra to principal / month", hint: "Optional. $0 if you pay only the required amount.", kind: "monthly" },
];

const ESCROW_FIELDS: Field[] = [
  { key: "propertyTaxAnnual", label: "Property tax / year", hint: "Adjust this. Often 1–2% of price.", kind: "money" },
  { key: "homeInsuranceAnnual", label: "Home insurance / year", hint: "Dwelling cover. Inflates with the rest of life.", kind: "money" },
  { key: "hoaMonthly", label: "HOA / month", hint: "$0 if there is no association.", kind: "monthly" },
  { key: "pmiMonthly", label: "PMI / month", hint: "Usually $0 at 20% down. Drops when loan-to-value hits 80%.", kind: "monthly" },
  { key: "maintenanceAnnual", label: "Upkeep / year", hint: "Repairs and replacements. Default is 1% of price.", kind: "money" },
];

const LIFE_FIELDS: Field[] = [
  { key: "foodMonthly", label: "Food / month", hint: "Groceries and eating out.", kind: "monthly" },
  { key: "schoolMonthly", label: "School / month", hint: "Leave $0 if there are no school-age kids.", kind: "monthly" },
  { key: "extracurricularMonthly", label: "Extra-curricular / month", hint: "Sports, lessons, camps. $0 if none.", kind: "monthly" },
  { key: "travelMonthly", label: "Travel / month", hint: "A monthly stand-in for trips.", kind: "monthly" },
  { key: "healthMonthly", label: "Health / month", hint: "Premiums and typical out-of-pocket.", kind: "monthly" },
  { key: "dependentsMonthly", label: "Other dependents / month", hint: "Support you already pay. $0 if none.", kind: "monthly" },
  { key: "carLoanMonthly", label: "Car loan / month", hint: "Stays flat, then stops after the years below.", kind: "monthly" },
  { key: "carLoanYears", label: "Car loan years left", hint: "0 if the car is paid off.", kind: "years" },
  { key: "otherLoanMonthly", label: "Other loans / month", hint: "Student, personal, or other installment debt.", kind: "monthly" },
  { key: "otherLoanYears", label: "Other-loan years left", hint: "0 if none.", kind: "years" },
];

const CASH_FIELDS: Field[] = [
  { key: "annualIncome", label: "Yearly take-home", hint: "What can actually pay the house and the rest of life.", kind: "money" },
  { key: "investmentPile", label: "Investment pile now", hint: "Separate from the down payment. Drawn if a year is short.", kind: "money" },
];

const RATE_FIELDS: Field[] = [
  { key: "inflationRate", label: "Inflation", hint: "Applied to income, tax, insurance, HOA, upkeep, and living costs.", kind: "percent" },
  { key: "investmentReturn", label: "Return on the pile", hint: "How the buffer grows after a surplus or a draw.", kind: "percent" },
];

const COMPARE_FIELDS: Field[] = [
  { key: "compareHomePrice", label: "Compare price", hint: "Same house, or another listing.", kind: "money" },
  { key: "compareDownPayment", label: "Compare down payment", hint: "Cash toward that price.", kind: "money" },
  { key: "compareAnnualRate", label: "Compare rate", hint: "A 15-year quote is often lower.", kind: "percent" },
  { key: "compareTermYears", label: "Compare term", hint: "Set to 0 to hide the compare.", kind: "years" },
];

function displayValue(value: number, kind: FieldKind): string {
  const n = Number.isFinite(value) ? value : 0;
  if (kind === "percent") return String(Number((n * 100).toFixed(4)));
  if (Number.isInteger(n)) return String(n);
  return String(Number(n.toFixed(2)));
}

export function MortgageForm({ values, onChange, onSubmit, loading, error }: Props) {
  const setField = (key: keyof MortgageInput, raw: string, kind: FieldKind) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    const stored = kind === "percent" ? n / 100 : n;
    onChange(mergeMortgageInput({ ...values, [key]: stored }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  const downPct = downPaymentPercent(values.homePrice, values.downPayment);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="card">
        <h2 className="font-serif text-xl leading-tight text-pine">1. The house and the loan</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Rate and term are yours to move. Down payment is {formatPercent(downPct, 1)} of price.
        </p>
        <div className="mt-5 grid items-end gap-x-6 gap-y-6 sm:grid-cols-2">
          {HOUSE_FIELDS.map((field) => (
            <MortgageField key={field.key} field={field} values={values} onChange={setField} />
          ))}
        </div>
      </section>

      <AdSlot placement="form-break-1" />

      <section className="card">
        <h2 className="font-serif text-xl leading-tight text-pine">2. Tax, insurance, HOA, PMI</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          These sit beside principal and interest. Tax and insurance inflate. PMI stops when loan-to-value reaches 80%.
        </p>
        <div className="mt-5 grid items-end gap-x-6 gap-y-6 sm:grid-cols-2">
          {ESCROW_FIELDS.map((field) => (
            <MortgageField key={field.key} field={field} values={values} onChange={setField} />
          ))}
        </div>
      </section>

      <details className="card group">
        <summary className="cursor-pointer list-none font-serif text-xl leading-tight text-pine marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block text-xs font-sans transition group-open:rotate-90">▶</span>
            3. Life around the house
          </span>
        </summary>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Food, school, travel, extras, health, dependents, and other loans. School and extras stay $0 if there are no
          kids. Living costs inflate. Installment loans do not.
        </p>
        <div className="mt-4 grid gap-x-5 gap-y-5 sm:grid-cols-2">
          {LIFE_FIELDS.map((field) => (
            <MortgageField key={field.key} field={field} values={values} onChange={setField} />
          ))}
        </div>
      </details>

      <section className="card">
        <h2 className="font-serif text-xl leading-tight text-pine">4. Income and the investment pile</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          A surplus year adds to the pile. A short year draws the pile before the house is “unaffordable.”
        </p>
        <div className="mt-5 grid items-end gap-x-6 gap-y-6 sm:grid-cols-2">
          {CASH_FIELDS.map((field) => (
            <MortgageField key={field.key} field={field} values={values} onChange={setField} />
          ))}
        </div>
      </section>

      <details className="card group">
        <summary className="cursor-pointer list-none font-medium text-pine marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block text-xs transition group-open:rotate-90">▶</span>
            5. Inflation and returns
          </span>
        </summary>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Same year-by-year step as the other tools. Not a forecast.
        </p>
        <div className="mt-4 grid gap-x-5 gap-y-5 sm:grid-cols-2">
          {RATE_FIELDS.map((field) => (
            <MortgageField key={field.key} field={field} values={values} onChange={setField} />
          ))}
        </div>
      </details>

      <details className="card group">
        <summary className="cursor-pointer list-none font-medium text-pine marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block text-xs transition group-open:rotate-90">▶</span>
            6. Compare another loan
          </span>
        </summary>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Same life costs and the same pile. Change rate, term, price, or down payment. Default compare is a 15-year
          quote. Set compare term to 0 to hide it.
        </p>
        <div className="mt-4 grid gap-x-5 gap-y-5 sm:grid-cols-2">
          {COMPARE_FIELDS.map((field) => (
            <MortgageField key={field.key} field={field} values={values} onChange={setField} />
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
        {loading ? "Running the years…" : "See if the house still leaves a buffer"}
      </button>
    </form>
  );
}

function MortgageField({
  field,
  values,
  onChange,
}: {
  field: Field;
  values: MortgageInput;
  onChange: (key: keyof MortgageInput, raw: string, kind: FieldKind) => void;
}) {
  const id = `mortgage-${field.key}`;
  const numeric = values[field.key];
  const step = field.kind === "percent" ? "0.1" : field.kind === "years" ? "1" : "50";

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
