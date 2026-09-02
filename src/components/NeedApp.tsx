"use client";

import { useEffect, useRef, useState } from "react";
import { AdSidebar, AdSlot } from "@/components/AdSlot";
import { calculatorAdGridClass } from "@/lib/ads";
import { NeedForm } from "@/components/NeedForm";
import { NEED_DEFAULT } from "@/lib/need/defaults";
import type { NeedEstimate } from "@/lib/need/estimateNeed";
import type { CalculatorInput } from "@/lib/engine";
import { formatMoney } from "@/lib/format";
import { inputToSearchParams, readScenarioFromLocation, writeScenarioUrl } from "@/lib/scenarioUrl";
import Link from "next/link";

export function NeedApp() {
  const [values, setValues] = useState<CalculatorInput>(NEED_DEFAULT);
  const [result, setResult] = useState<NeedEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const urlReady = useRef(false);

  function changeValues(next: CalculatorInput) {
    setValues(next);
    if (urlReady.current) writeScenarioUrl(next);
  }

  async function calculate(nextValues?: CalculatorInput) {
    const payload = nextValues ?? values;
    if (nextValues) setValues(nextValues);
    writeScenarioUrl(payload);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/need", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as NeedEstimate & { error?: string; errors?: string[] };
      if (!response.ok) {
        setError(data.errors?.join(" ") || data.error || "Could not run the estimate.");
        setResult(null);
        return;
      }
      setResult(data);
      requestAnimationFrame(() => {
        document.getElementById("need-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fromUrl = readScenarioFromLocation();
    urlReady.current = true;
    if (!fromUrl) return;
    setValues(fromUrl);
    void calculate(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intended one-shot
  }, []);

  return (
    <div className={calculatorAdGridClass()}>
      <div className="min-w-0 space-y-6">
        <AdSlot placement="after-intro" />
        <NeedForm
          values={values}
          onChange={changeValues}
          onSubmit={() => void calculate()}
          loading={loading}
          error={error}
        />
        <AdSlot placement="mid-form" />
        {result ? (
          <>
            <AdSlot placement="pre-outlook" />
            <NeedResult result={result} />
            <AdSlot placement="after-stats" />
          </>
        ) : null}
      </div>
      <AdSidebar />
    </div>
  );
}

function NeedResult({ result }: { result: NeedEstimate }) {
  const { input } = result;
  const longevityHref = `/longevity?${inputToSearchParams(input).toString()}`;
  return (
    <section id="need-result" className="space-y-5">
      <div className="card border-gold/40 bg-gold/10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Entered plan — not comfortable living</p>
        <h2 className="mt-2 font-serif text-2xl text-pine">Nest egg needed today</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/80">
          Savings on hand now so this spending and income path lasts through age {input.planToAge}. Housing, care, and
          side-hustle are included only if you put them on a later tool; this form leaves those at $0.
        </p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Nest egg needed</dt>
            <dd className="mt-1 font-serif text-2xl text-ink">{formatMoney(result.nestEggNeededNow)}</dd>
            <p className="mt-1 text-xs text-muted">Today’s dollars.</p>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">You have</dt>
            <dd className="mt-1 font-serif text-2xl text-ink">{formatMoney(input.currentSavings)}</dd>
            <p className="mt-1 text-xs text-muted">
              {result.alreadyEnough
                ? "Already enough in this model."
                : `${formatMoney(result.additionalNestEgg)} more than you entered.`}
            </p>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Extra to save / year</dt>
            <dd className="mt-1 font-serif text-2xl text-ink">
              {result.alreadyEnough || result.yearsToRetirement <= 0 ? "$0" : formatMoney(result.additionalAnnualSavings)}
            </dd>
            <p className="mt-1 text-xs text-muted">
              {result.yearsToRetirement <= 0
                ? "Full-time work has already ended, so this is a nest-egg gap, not extra yearly saving."
                : "On top of the annual savings already on this form, until full-time work ends."}
            </p>
          </div>
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-ink/85">
          With {formatMoney(Math.max(input.currentSavings, result.nestEggNeededNow))} today, this path is modeled through
          age <strong>{result.fundedThroughIfFunded}</strong>.
        </p>
        <p className="mt-4 text-sm">
          <Link href={longevityHref} className="font-medium text-pine underline decoration-pine/30 underline-offset-2">
            Open this scenario in How long before I go broke
          </Link>
          <span className="text-muted"> — year-by-year outlook, chart, and PDF.</span>
        </p>
      </div>
      {result.warnings.length > 0 ? (
        <ul className="card list-disc space-y-1 px-8 text-sm text-muted">
          {result.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
