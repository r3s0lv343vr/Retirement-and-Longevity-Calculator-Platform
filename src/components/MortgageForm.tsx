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

const ESCROW_FIELDS: Field[] = [
  { key: "propertyTaxAnnual", label: "Property tax / year", hint: "Adjust this. Often 1–2% of price.", kind: "money" },
  { key: "homeInsuranceAnnual", label: "Home insurance / year", hint: "Dwelling cover. Can grow faster than inflation.", kind: "money" },
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

const EXTRA_FIELDS: Field[] = [
  { key: "extraMonthly", label: "Extra / month", hint: "Recurring extra to principal.", kind: "monthly" },
  { key: "extraAnnual", label: "Extra / year", hint: "A yearly lump added in month 12.", kind: "money" },
  { key: "extraOneTime", label: "One-time extra", hint: "A single extra payment.", kind: "money" },
  { key: "extraOneTimeMonth", label: "One-time in month", hint: "Month 1 is the first payment.", kind: "years" },
];

const BUY_FIELDS: Field[] = [
  { key: "closingCost", label: "Closing costs", hint: "Editable estimate, not a universal percent.", kind: "money" },
  { key: "movingCost", label: "Moving", hint: "Optional. $0 if you skip it.", kind: "money" },
  { key: "furnishingCost", label: "Repairs / furnishing", hint: "Optional cash after closing.", kind: "money" },
];

const RATE_FIELDS: Field[] = [
  { key: "inflationRate", label: "Inflation", hint: "Income, upkeep, and living costs.", kind: "percent" },
  { key: "taxGrowthRate", label: "Tax growth", hint: "Property tax each year.", kind: "percent" },
  { key: "insuranceGrowthRate", label: "Insurance growth", hint: "Home insurance each year.", kind: "percent" },
  { key: "hoaGrowthRate", label: "HOA growth", hint: "HOA each year.", kind: "percent" },
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

  const setPrice = (raw: string) => {
    const price = Number(raw);
    if (!Number.isFinite(price)) return;
    const pct = downPaymentPercent(values.homePrice, values.downPayment);
    onChange(mergeMortgageInput({ ...values, homePrice: price, downPayment: price * pct }));
  };

  const setDownDollars = (raw: string) => {
    const down = Number(raw);
    if (!Number.isFinite(down)) return;
    onChange(mergeMortgageInput({ ...values, downPayment: down }));
  };

  const setDownPercent = (raw: string) => {
    const pct = Number(raw);
    if (!Number.isFinite(pct)) return;
    onChange(mergeMortgageInput({ ...values, downPayment: values.homePrice * (pct / 100) }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  const downPct = downPaymentPercent(values.homePrice, values.downPayment);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="card">
        <h2 className="font-serif text-xl leading-tight text-pine">Home price, down payment, rate, term</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          The short path to a first result. Down payment is {formatPercent(downPct, 1)} of price — dollars and
          percent stay in sync.
        </p>
        <div className="mt-5 grid items-end gap-x-6 gap-y-6 sm:grid-cols-2">
          <MortgageField
            id="mortgage-homePrice"
            label="Home price"
            hint="Contract price, not the loan."
            kind="money"
            value={values.homePrice}
            onChange={setPrice}
          />
          <MortgageField
            id="mortgage-downPayment"
            label="Down payment"
            hint="Cash at closing toward the price."
            kind="money"
            value={values.downPayment}
            onChange={setDownDollars}
          />
          <MortgageField
            id="mortgage-downPercent"
            label="Down payment %"
            hint="Moves the dollar amount."
            kind="percent"
            value={downPct}
            onChange={setDownPercent}
          />
          <MortgageField
            id="mortgage-annualRate"
            label="Interest rate"
            hint="Quoted annual rate."
            kind="percent"
            value={values.annualRate}
            onChange={(raw) => setField("annualRate", raw, "percent")}
          />
          <MortgageField
            id="mortgage-termYears"
            label="Term"
            hint="Usually 15 or 30 years."
            kind="years"
            value={values.termYears}
            onChange={(raw) => setField("termYears", raw, "years")}
          />
        </div>
      </section>

      <AdSlot placement="form-break-1" />

      <details className="card group">
        <summary className="cursor-pointer list-none font-serif text-xl leading-tight text-pine marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block text-xs font-sans transition group-open:rotate-90">▶</span>
            Tax, insurance, HOA, PMI
          </span>
        </summary>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          These sit beside principal and interest. Growth rates are in Advanced assumptions.
        </p>
        <div className="mt-4 grid gap-x-5 gap-y-5 sm:grid-cols-2">
          {ESCROW_FIELDS.map((field) => (
            <MortgageBoundField key={field.key} field={field} values={values} onChange={setField} />
          ))}
        </div>
      </details>

      <details className="card group">
        <summary className="cursor-pointer list-none font-serif text-xl leading-tight text-pine marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block text-xs font-sans transition group-open:rotate-90">▶</span>
            Life around the house
          </span>
        </summary>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Food, school, travel, extras, health, dependents, and other loans. Living costs inflate. Installment
          loans do not.
        </p>
        <div className="mt-4 grid gap-x-5 gap-y-5 sm:grid-cols-2">
          {LIFE_FIELDS.map((field) => (
            <MortgageBoundField key={field.key} field={field} values={values} onChange={setField} />
          ))}
        </div>
      </details>

      <details className="card group">
        <summary className="cursor-pointer list-none font-serif text-xl leading-tight text-pine marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block text-xs font-sans transition group-open:rotate-90">▶</span>
            Income and the investment pile
          </span>
        </summary>
        <div className="mt-4 grid gap-x-5 gap-y-5 sm:grid-cols-2">
          {CASH_FIELDS.map((field) => (
            <MortgageBoundField key={field.key} field={field} values={values} onChange={setField} />
          ))}
        </div>
      </details>

      <details className="card group">
        <summary className="cursor-pointer list-none font-serif text-xl leading-tight text-pine marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block text-xs font-sans transition group-open:rotate-90">▶</span>
            Extra payments
          </span>
        </summary>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Monthly, yearly, or one-time extra to principal. Results also have +$100 / +$250 / +$500.
        </p>
        <div className="mt-4 grid gap-x-5 gap-y-5 sm:grid-cols-2">
          {EXTRA_FIELDS.map((field) => (
            <MortgageBoundField key={field.key} field={field} values={values} onChange={setField} />
          ))}
        </div>
      </details>

      <details className="card group">
        <summary className="cursor-pointer list-none font-serif text-xl leading-tight text-pine marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block text-xs font-sans transition group-open:rotate-90">▶</span>
            Cash needed to buy
          </span>
        </summary>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Down payment plus the estimates below. Change them; they are not a lender quote.
        </p>
        <div className="mt-4 grid gap-x-5 gap-y-5 sm:grid-cols-2">
          {BUY_FIELDS.map((field) => (
            <MortgageBoundField key={field.key} field={field} values={values} onChange={setField} />
          ))}
        </div>
      </details>

      <details className="card group">
        <summary className="cursor-pointer list-none font-serif text-xl leading-tight text-pine marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block text-xs font-sans transition group-open:rotate-90">▶</span>
            Advanced assumptions
          </span>
        </summary>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Separate growth for tax, insurance, and HOA. Inflation still moves income, upkeep, and life.
        </p>
        <div className="mt-4 grid gap-x-5 gap-y-5 sm:grid-cols-2">
          {RATE_FIELDS.map((field) => (
            <MortgageBoundField key={field.key} field={field} values={values} onChange={setField} />
          ))}
        </div>
      </details>

      <details className="card group">
        <summary className="cursor-pointer list-none font-serif text-xl leading-tight text-pine marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block text-xs font-sans transition group-open:rotate-90">▶</span>
            Compare another loan
          </span>
        </summary>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Same life costs and the same pile. Set compare term to 0 to hide it.
        </p>
        <div className="mt-4 grid gap-x-5 gap-y-5 sm:grid-cols-2">
          {COMPARE_FIELDS.map((field) => (
            <MortgageBoundField key={field.key} field={field} values={values} onChange={setField} />
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
        {loading ? "Running the years…" : "See what this house actually costs"}
      </button>
    </form>
  );
}

function MortgageBoundField({
  field,
  values,
  onChange,
}: {
  field: Field;
  values: MortgageInput;
  onChange: (key: keyof MortgageInput, raw: string, kind: FieldKind) => void;
}) {
  return (
    <MortgageField
      id={`mortgage-${field.key}`}
      label={field.label}
      hint={field.hint}
      kind={field.kind}
      value={values[field.key]}
      onChange={(raw) => onChange(field.key, raw, field.kind)}
    />
  );
}

function MortgageField({
  id,
  label,
  hint,
  kind,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  kind: FieldKind;
  value: number;
  onChange: (raw: string) => void;
}) {
  const step = kind === "percent" ? "0.1" : kind === "years" ? "1" : "50";

  return (
    <label htmlFor={id} className="flex min-w-0 flex-col gap-1.5">
      <span>
        <span className="block text-sm font-medium leading-snug text-ink">{label}</span>
        <span className="mt-0.5 block text-xs leading-snug text-muted">{hint}</span>
      </span>
      <div className="relative">
        <input
          id={id}
          name={id}
          type="number"
          inputMode="decimal"
          step={step}
          value={displayValue(value, kind)}
          onChange={(e) => onChange(e.target.value)}
          className={`h-11 w-full min-w-0 rounded-lg border border-pine/15 bg-paper px-3 text-ink outline-none ring-gold/40 focus:ring-2 ${kind === "percent" ? "pr-12" : "pr-3"}`}
        />
        {kind === "percent" ? (
          <span className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-sm text-muted">%</span>
        ) : null}
      </div>
    </label>
  );
}
