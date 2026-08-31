"use client";

import { AdSlot } from "@/components/AdSlot";
import { FIELD_META } from "@/lib/engine";
import type { AdPlacement } from "@/lib/ads";
import type { CalculatorInput } from "@/lib/engine";
import type { FormEvent } from "react";

type Props = {
  values: CalculatorInput;
  onChange: (next: CalculatorInput) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
};

const GROUPS: {
  id: string;
  title: string;
  blurb: string;
  keys: (keyof CalculatorInput)[];
  advanced?: boolean;
  columns: 2 | 3;
}[] = [
  {
    id: "timeline",
    title: "Your timeline",
    blurb: "When work tapers off, and how long you want the money to last. Two persons adds the partner’s age, work-end, and plan-through age. Drawdowns start when the first of you leaves full-time work; yearly saving continues until the later work-end.",
    keys: ["currentAge", "retirementAge", "planToAge", "twoPerson"],
    columns: 3,
  },
  {
    id: "savings",
    title: "Nest egg",
    blurb:
      "Current savings grow as a future value. Annual savings are a level deposit each year (ordinary annuity) unless you turn on the inflation toggle below. Inflation always raises later spending.",
    keys: ["currentSavings", "annualContribution", "preRetirementReturn", "savingsGrowWithInflation"],
    columns: 3,
  },
  {
    id: "work",
    title: "Phased work",
    blurb:
      "Wages during the window are income × years. You can also invest extra each year: that grows as an ordinary annuity, or as amount × years if the rate is 0%. Leave the extra fields at 0 to skip.",
    keys: [
      "partTimeAnnualIncome",
      "partTimeStartAge",
      "partTimeEndAge",
      "partTimeAnnualInvestment",
      "partTimeInvestmentReturn",
    ],
    columns: 2,
  },
  {
    id: "income",
    title: "Guaranteed income",
    blurb:
      "Social Security has COLA (rises with general inflation). Pension is added from its start age through the plan-through age, not before the nest-egg cutoff. Turn pension COLA off if that pension does not adjust. If pension is $0, only Social Security is used.",
    keys: ["socialSecurityAnnual", "socialSecurityStartAge", "pensionAnnual", "pensionStartAge", "pensionCola"],
    columns: 2,
  },
  {
    id: "partner",
    title: "Second person",
    blurb:
      "Partner Social Security and pension, a second side hustle, and their care. Their age and plan-through age are on Your timeline. After the first death, household Social Security becomes the larger check; a pension continues only by the survivor share you set. Lifestyle then uses the survivor factor. Optional life-insurance face amount enters the pot the first survivor year; $0 skips. One nest egg and one set of market returns.",
    keys: [
      "partnerSocialSecurityAnnual",
      "partnerSocialSecurityStartAge",
      "partnerPensionAnnual",
      "partnerPensionStartAge",
      "partnerPensionCola",
      "pensionSurvivorPercent",
      "partnerPensionSurvivorPercent",
      "partnerPartTimeAnnualIncome",
      "partnerPartTimeStartAge",
      "partnerPartTimeEndAge",
      "partnerHealthcareSpendToday",
      "partnerLongTermCareAnnual",
      "partnerLongTermCareStartAge",
      "partnerNursingHomeRentAnnual",
      "partnerNursingHomeStartAge",
      "survivorLifestyleFactor",
      "lifeInsuranceLump",
    ],
    columns: 2,
  },
  {
    id: "spending",
    title: "Spending today",
    blurb: "Lifestyle and health are tracked separately so medical inflation can outrun the CPI. A suggested comfortable-living estimate appears in your outlook.",
    keys: ["lifestyleSpendToday", "healthcareSpendToday", "longTermCareAnnual", "longTermCareStartAge"],
    columns: 2,
  },
  {
    id: "housing",
    title: "Later-life housing",
    blurb:
      "Senior rental, nursing home, or continuing-care rent. Only one applies each year: CCRC first, then nursing, then independent living. Nursing and CCRC rent inflate with healthcare costs; independent living follows general inflation. Lifestyle spending is reduced while you live there.",
    keys: [
      "seniorHomeRentAnnual",
      "seniorHomeStartAge",
      "nursingHomeRentAnnual",
      "nursingHomeStartAge",
      "ccrcRentAnnual",
      "ccrcStartAge",
    ],
    columns: 2,
  },
  {
    id: "assumptions",
    title: "Market & inflation",
    blurb: "Nominal annual rates.",
    keys: ["inflationRate", "healthcareInflationRate", "postRetirementReturn"],
    advanced: true,
    columns: 2,
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
    columns: 2,
  },
];

const ADS_AFTER: Partial<Record<string, AdPlacement>> = {
  timeline: "form-break-1",
  savings: "form-break-2",
  work: "form-break-3",
  income: "form-break-4",
};

function displayValue(value: number, kind: string): string {
  if (kind === "percent") return String(Number((value * 100).toFixed(4)));
  if (kind === "multiplier") return String(Number(value.toFixed(4)));
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(2)));
}

export function CalculatorForm({ values, onChange, onSubmit, loading, error }: Props) {
  const setField = (key: keyof CalculatorInput, raw: string, kind: string) => {
    if (kind === "toggle") {
      onChange({ ...values, [key]: raw === "true" });
      return;
    }
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {GROUPS.filter((g) => !g.advanced && (g.id !== "partner" || values.twoPerson)).map((group) => (
        <div key={group.id} className="space-y-5">
          <section className="card">
            <h2 className="font-serif text-xl leading-tight text-pine">{group.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {group.blurb}
              {values.twoPerson && group.id === "work"
                ? " This is extra work after retirement. Pay while still in full-time work is on Your timeline, next to each work-end."
                : ""}
              {values.twoPerson && group.id === "income"
                ? " These are the first person’s checks; the partner’s are on the Second person card."
                : ""}
              {values.twoPerson && group.id === "spending"
                ? " Healthcare and long-term care here are the first person’s."
                : ""}
              {values.twoPerson && group.id === "housing"
                ? " These rents are the first person’s (or a shared CCRC). If only one person is in nursing, household lifestyle is not cut."
                : ""}
            </p>
            <div
              className={`mt-5 grid items-end gap-x-6 gap-y-6 ${
                group.columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
              }`}
            >
              {visibleKeys(group, values.twoPerson).map((key) => (
                <Field
                  key={key}
                  fieldKey={key}
                  values={values}
                  onChange={setField}
                  wide={
                    (group.id === "work" && key === "partTimeAnnualIncome") ||
                    (group.id === "income" && key === "pensionCola") ||
                    (group.id === "savings" && key === "savingsGrowWithInflation") ||
                    (group.id === "timeline" && key === "twoPerson") ||
                    (group.id === "partner" && key === "partnerPensionCola")
                  }
                />
              ))}
            </div>
          </section>
          {ADS_AFTER[group.id] ? <AdSlot placement={ADS_AFTER[group.id] as AdPlacement} /> : null}
        </div>
      ))}

      <details className="card group">
        <summary className="cursor-pointer list-none font-medium text-pine marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block text-xs transition group-open:rotate-90">▶</span>
            Advanced assumptions
          </span>
        </summary>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Change these if you have a specific plan. Defaults are conservative US planning figures.
        </p>
        {GROUPS.filter((g) => g.advanced).map((group) => (
          <div key={group.id} className="mt-6 border-t border-pine/10 pt-5">
            <h3 className="font-serif text-lg text-pine">{group.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{group.blurb}</p>
            <div className="mt-4 grid gap-x-5 gap-y-5 sm:grid-cols-2">
              {group.keys.map((key) => (
                <Field key={key} fieldKey={key} values={values} onChange={setField} />
              ))}
            </div>
          </div>
        ))}
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
        {loading ? "Running projection…" : "See longevity outlook"}
      </button>
    </form>
  );
}

function visibleKeys(
  group: (typeof GROUPS)[number],
  twoPerson: boolean,
): (keyof CalculatorInput)[] {
  if (group.id === "timeline" && twoPerson) {
    return [
      ...group.keys,
      "partnerCurrentAge",
      "partnerRetirementAge",
      "partnerPlanToAge",
      "annualWorkIncome",
      "partnerAnnualWorkIncome",
    ];
  }
  return group.keys;
}

function Field({
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
  const id = `field-${fieldKey}`;

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
            className={`text-sm font-semibold transition ${
              on ? "bg-pine text-paper" : "text-muted hover:bg-paper-2"
            }`}
            onClick={() => onChange(fieldKey, "true", "toggle")}
          >
            On
          </button>
          <button
            type="button"
            aria-pressed={!on}
            className={`text-sm font-semibold transition ${
              !on ? "bg-pine text-paper" : "text-muted hover:bg-paper-2"
            }`}
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
