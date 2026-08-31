"use client";

import { useEffect, useRef, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import { ClaimForm } from "@/components/ClaimForm";
import { CLAIM_DEFAULT } from "@/lib/claim/defaults";
import type { ClaimEstimate } from "@/lib/claim/estimateClaim";
import type { CalculatorInput } from "@/lib/engine";
import { formatMoney } from "@/lib/format";
import { inputToSearchParams, readScenarioFromLocation, writeScenarioUrl } from "@/lib/scenarioUrl";
import Link from "next/link";

export function ClaimApp() {
  const [values, setValues] = useState<CalculatorInput>(CLAIM_DEFAULT);
  const [result, setResult] = useState<ClaimEstimate | null>(null);
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
      const response = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as ClaimEstimate & { error?: string; errors?: string[] };
      if (!response.ok) {
        setError(data.errors?.join(" ") || data.error || "Could not run the compare.");
        setResult(null);
        return;
      }
      setResult(data);
      requestAnimationFrame(() => {
        document.getElementById("claim-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
        <ClaimForm
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
            <ClaimResult result={result} />
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

function ClaimResult({ result }: { result: ClaimEstimate }) {
  const longevityHref = `/longevity?${inputToSearchParams(result.input).toString()}`;
  const headline =
    result.longerClaim === 70
      ? "Claiming at 70 lasts longer in this model"
      : result.longerClaim === 67
        ? "Claiming at 67 lasts longer in this model"
        : "Both claim ages last through the same age";
  const deltaYears = Math.abs(result.fundedThroughDelta);

  return (
    <section id="claim-result" className="space-y-5">
      <div className="card border-gold/40 bg-gold/10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Social Security — 67 vs 70</p>
        <h2 className="mt-2 font-serif text-2xl text-pine">{headline}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/80">
          The check you entered is {formatMoney(result.enteredAnnual)} starting at age {result.enteredStartAge}. This
          compare scales that check the way delayed retirement credits work in the U.S. — full retirement age 67, and
          age 70 is 24% higher — then runs the same spending path with fewer years of checks.
          {result.longerClaim === "same"
            ? " Both paths are modeled through the same age."
            : ` Claiming at ${result.longerClaim} is modeled ${deltaYears} year${deltaYears === 1 ? "" : "s"} farther.`}
        </p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-pine/10 bg-paper-2/40 p-4">
            <dt className="text-xs uppercase tracking-wide text-muted">Claim at 67</dt>
            <dd className="mt-1 font-serif text-2xl text-ink">{formatMoney(result.claiming67Annual)} / year</dd>
            <p className="mt-1 text-sm text-ink/85">
              Funded through age <strong>{result.claiming67FundedThroughAge}</strong>
            </p>
            <p className="mt-1 text-xs text-muted">Today’s dollars, then COLA from that start age.</p>
          </div>
          <div className="rounded-xl border border-pine/10 bg-paper-2/40 p-4">
            <dt className="text-xs uppercase tracking-wide text-muted">Claim at 70</dt>
            <dd className="mt-1 font-serif text-2xl text-ink">{formatMoney(result.claiming70Annual)} / year</dd>
            <p className="mt-1 text-sm text-ink/85">
              Funded through age <strong>{result.claiming70FundedThroughAge}</strong>
            </p>
            <p className="mt-1 text-xs text-muted">Higher benefit, three fewer years of checks.</p>
          </div>
        </dl>
        <p className="mt-4 text-sm">
          <Link href={longevityHref} className="font-medium text-pine underline decoration-pine/30 underline-offset-2">
            Open this scenario in How long before I go broke
          </Link>
          <span className="text-muted"> — full outlook. The 67 vs 70 card is still there.</span>
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
