"use client";

import { useMemo, useState } from "react";
import { PlanSnapshotCard } from "@/components/PlanSnapshotCard";
import {
  WHAT_IF_LEVER_COPY,
  WHAT_IF_LEVERS,
  compareWhatIf,
  fundedThroughDeltaCopy,
  suggestedWhatIfValue,
} from "@/lib/engine";
import type { CalculatorInput, ProjectionResult, WhatIfLever } from "@/lib/engine";

type Props = {
  result: ProjectionResult;
};

export function WhatIfCompare({ result }: Props) {
  const [lever, setLever] = useState<WhatIfLever>("retirementAge");
  const [retirementAge, setRetirementAge] = useState(() =>
    Number(suggestedWhatIfValue(result.input, "retirementAge")),
  );
  const [socialSecurityStartAge, setSocialSecurityStartAge] = useState(() =>
    Number(suggestedWhatIfValue(result.input, "socialSecurityStartAge")),
  );
  const [pensionCola, setPensionCola] = useState(
    () => Boolean(suggestedWhatIfValue(result.input, "pensionCola")),
  );
  const [healthcareInflationPct, setHealthcareInflationPct] = useState(() =>
    Number((Number(suggestedWhatIfValue(result.input, "healthcareInflationRate")) * 100).toFixed(1)),
  );

  const baselineKey = whatIfBaselineKey(result.input);
  const [seenKey, setSeenKey] = useState(baselineKey);
  if (seenKey !== baselineKey) {
    setSeenKey(baselineKey);
    setLever("retirementAge");
    setRetirementAge(Number(suggestedWhatIfValue(result.input, "retirementAge")));
    setSocialSecurityStartAge(Number(suggestedWhatIfValue(result.input, "socialSecurityStartAge")));
    setPensionCola(Boolean(suggestedWhatIfValue(result.input, "pensionCola")));
    setHealthcareInflationPct(
      Number((Number(suggestedWhatIfValue(result.input, "healthcareInflationRate")) * 100).toFixed(1)),
    );
  }

  const value = currentLeverValue(lever, {
    retirementAge,
    socialSecurityStartAge,
    pensionCola,
    healthcareInflationPct,
  });

  const compare = useMemo(
    () => compareWhatIf(result.input, result.outlook, lever, value),
    [result.input, result.outlook, lever, value],
  );

  return (
    <section className="card">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">What if — entered plan</p>
      <h3 className="mt-2 font-serif text-2xl text-pine">Change one thing</h3>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
        Keep this run as it is. Change one input and see the new funded-through age beside it. This uses the entered
        plan, not the comfortable-living suggestion.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {WHAT_IF_LEVERS.map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={lever === key}
            onClick={() => setLever(key)}
            className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
              lever === key ? "bg-pine text-paper" : "border border-pine/15 bg-paper text-ink hover:bg-paper-2"
            }`}
          >
            {WHAT_IF_LEVER_COPY[key].chip}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted">{WHAT_IF_LEVER_COPY[lever].hint}</p>

      <div className="mt-4 max-w-sm">
        {lever === "retirementAge" ? (
          <NumberField
            id="what-if-retirement-age"
            label="Full-time work ends"
            value={retirementAge}
            onChange={setRetirementAge}
          />
        ) : null}
        {lever === "socialSecurityStartAge" ? (
          <NumberField
            id="what-if-ss-start"
            label="Social Security starts"
            value={socialSecurityStartAge}
            onChange={setSocialSecurityStartAge}
          />
        ) : null}
        {lever === "pensionCola" ? (
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="block text-sm font-medium leading-snug text-ink">Pension COLA</span>
            <div className="grid h-11 grid-cols-2 overflow-hidden rounded-lg border border-pine/15 bg-paper">
              <button
                type="button"
                aria-pressed={pensionCola}
                className={`text-sm font-semibold transition ${
                  pensionCola ? "bg-pine text-paper" : "text-muted hover:bg-paper-2"
                }`}
                onClick={() => setPensionCola(true)}
              >
                On
              </button>
              <button
                type="button"
                aria-pressed={!pensionCola}
                className={`text-sm font-semibold transition ${
                  !pensionCola ? "bg-pine text-paper" : "text-muted hover:bg-paper-2"
                }`}
                onClick={() => setPensionCola(false)}
              >
                Off
              </button>
            </div>
          </div>
        ) : null}
        {lever === "healthcareInflationRate" ? (
          <NumberField
            id="what-if-health-inflation"
            label="Healthcare inflation"
            value={healthcareInflationPct}
            onChange={setHealthcareInflationPct}
            step="0.1"
            suffix="%"
          />
        ) : null}
      </div>

      <p className="mt-4 text-sm text-ink/85">{compare.changeLabel}</p>

      {compare.errors.length > 0 ? (
        <p className="mt-3 text-sm text-short" role="alert">
          {compare.errors[0]}
        </p>
      ) : (
        <>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <PlanSnapshotCard
              label="This run"
              snapshot={compare.baseline}
              note="The outlook you just calculated."
            />
            <PlanSnapshotCard
              label="This what-if"
              snapshot={compare.variant}
              note={compare.sameAsBaseline ? "Same as this run — pick a different value." : "One change only."}
            />
          </dl>
          {compare.fundedThroughDelta != null ? (
            <p className="mt-5 text-sm font-medium text-pine">{fundedThroughDeltaCopy(compare.fundedThroughDelta)}</p>
          ) : null}
          {lever === "pensionCola" && result.input.pensionAnnual === 0 ? (
            <p className="mt-2 text-xs text-muted">
              Pension is $0 on this run, so turning COLA off does not change the funded-through age.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}

function currentLeverValue(
  lever: WhatIfLever,
  values: {
    retirementAge: number;
    socialSecurityStartAge: number;
    pensionCola: boolean;
    healthcareInflationPct: number;
  },
): CalculatorInput[WhatIfLever] {
  if (lever === "retirementAge") return values.retirementAge;
  if (lever === "socialSecurityStartAge") return values.socialSecurityStartAge;
  if (lever === "pensionCola") return values.pensionCola;
  return Math.round(values.healthcareInflationPct * 10) / 1000;
}

function whatIfBaselineKey(input: CalculatorInput): string {
  return JSON.stringify(input);
}

function NumberField({
  id,
  label,
  value,
  onChange,
  step = "1",
  suffix,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
  suffix?: string;
}) {
  return (
    <label htmlFor={id} className="flex min-w-0 flex-col gap-1.5">
      <span className="block text-sm font-medium leading-snug text-ink">{label}</span>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          value={Number.isFinite(value) ? value : ""}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isFinite(next)) onChange(next);
          }}
          className={`h-11 w-full min-w-0 rounded-lg border border-pine/15 bg-paper px-3 text-ink outline-none ring-gold/40 focus:ring-2 ${
            suffix ? "pr-12" : "pr-3"
          }`}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-sm text-muted">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}

