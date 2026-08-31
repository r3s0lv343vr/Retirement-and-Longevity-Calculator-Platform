"use client";

import { useEffect, useRef, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import { WhenForm } from "@/components/WhenForm";
import { WHEN_DEFAULT } from "@/lib/when/defaults";
import type { WorkEndEstimate } from "@/lib/when/estimateWorkEnd";
import type { CalculatorInput } from "@/lib/engine";
import { formatMoney } from "@/lib/format";
import { inputToSearchParams, readScenarioFromLocation, writeScenarioUrl } from "@/lib/scenarioUrl";
import Link from "next/link";

export function WhenApp() {
  const [values, setValues] = useState<CalculatorInput>(WHEN_DEFAULT);
  const [result, setResult] = useState<WorkEndEstimate | null>(null);
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
      const response = await fetch("/api/when", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as WorkEndEstimate & { error?: string; errors?: string[] };
      if (!response.ok) {
        setError(data.errors?.join(" ") || data.error || "Could not run the estimate.");
        setResult(null);
        return;
      }
      setResult(data);
      requestAnimationFrame(() => {
        document.getElementById("when-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_160px]">
      <div className="min-w-0 space-y-6">
        <AdSlot placement="after-intro" />
        <WhenForm
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
            <WhenResult result={result} />
            <AdSlot placement="after-stats" />
          </>
        ) : null}
      </div>
      <div className="hidden min-w-0 xl:block">
        <div className="sticky top-6 space-y-4">
          <AdSlot placement="sidebar" />
          <AdSlot placement="sidebar-2" />
          <AdSlot placement="sidebar-3" />
        </div>
      </div>
    </div>
  );
}

function WhenResult({ result }: { result: WorkEndEstimate }) {
  const { input, solvedInput } = result;
  const longevityHref = `/longevity?${inputToSearchParams(solvedInput).toString()}`;
  const needHref = `/need?${inputToSearchParams(input).toString()}`;
  const headline = result.cannotFund
    ? "Working longer does not fund this plan"
    : result.canStopNow
      ? "You can stop full-time work now"
      : `You can stop full-time work at age ${result.workEndAge}`;

  return (
    <section id="when-result" className="space-y-5">
      <div className="card border-gold/40 bg-gold/10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Entered plan — work-end, not nest egg</p>
        <h2 className="mt-2 font-serif text-2xl text-pine">{headline}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/80">
          {result.cannotFund
            ? `Even if full-time work continues through age ${solvedInput.retirementAge}, this spending and income path does not last through age ${input.planToAge} with the savings you entered.`
            : result.canStopNow
              ? `With the savings on this form, the entered path is modeled through age ${input.planToAge} if full-time work ends now.`
              : `After ${result.yearsOfWork} more year${result.yearsOfWork === 1 ? "" : "s"} of the yearly savings on this form, the entered path is modeled through age ${input.planToAge}.`}
        </p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Work ends</dt>
            <dd className="mt-1 font-serif text-2xl text-ink">
              {result.cannotFund ? "—" : `Age ${result.workEndAge}`}
            </dd>
            <p className="mt-1 text-xs text-muted">
              {result.cannotFund
                ? "No age in this horizon funds the plan."
                : result.canStopNow
                  ? "Earliest age this model allows."
                  : `${result.yearsOfWork} year${result.yearsOfWork === 1 ? "" : "s"} from your current age.`}
            </p>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Nest egg then</dt>
            <dd className="mt-1 font-serif text-2xl text-ink">{formatMoney(result.nestEggAtWorkEnd)}</dd>
            <p className="mt-1 text-xs text-muted">Grown from the savings and yearly deposits you entered.</p>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Modeled through</dt>
            <dd className="mt-1 font-serif text-2xl text-ink">Age {result.fundedThroughIfStopThen}</dd>
            <p className="mt-1 text-xs text-muted">
              {result.cannotFund
                ? "Short of the plan-through age even at the latest work-end."
                : `Plan-through age is ${input.planToAge}.`}
            </p>
          </div>
        </dl>
        <p className="mt-4 text-sm">
          <Link href={longevityHref} className="font-medium text-pine underline decoration-pine/30 underline-offset-2">
            Open this work-end in How long before I go broke
          </Link>
          <span className="text-muted"> — year-by-year outlook, chart, and PDF.</span>
        </p>
        {result.cannotFund ? (
          <p className="mt-2 text-sm">
            <Link href={needHref} className="font-medium text-pine underline decoration-pine/30 underline-offset-2">
              See how much nest egg would fund this plan
            </Link>
            <span className="text-muted"> — same spending, solved the other way.</span>
          </p>
        ) : null}
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
