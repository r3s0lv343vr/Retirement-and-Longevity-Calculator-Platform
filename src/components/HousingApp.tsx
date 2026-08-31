"use client";

import { useEffect, useRef, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import { HousingForm } from "@/components/HousingForm";
import { HOUSING_DEFAULT } from "@/lib/housing/defaults";
import type { HousingEstimate, HousingPath, HousingPathId } from "@/lib/housing/estimateHousing";
import type { CalculatorInput } from "@/lib/engine";
import { formatMoney } from "@/lib/format";
import { inputToSearchParams, readScenarioFromLocation, writeScenarioUrl } from "@/lib/scenarioUrl";
import Link from "next/link";

export function HousingApp() {
  const [values, setValues] = useState<CalculatorInput>(HOUSING_DEFAULT);
  const [result, setResult] = useState<HousingEstimate | null>(null);
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
      const response = await fetch("/api/housing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as HousingEstimate & { error?: string; errors?: string[] };
      if (!response.ok) {
        setError(data.errors?.join(" ") || data.error || "Could not run the compare.");
        setResult(null);
        return;
      }
      setResult(data);
      requestAnimationFrame(() => {
        document.getElementById("housing-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
        <HousingForm
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
            <HousingResult result={result} />
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

const PATH_COPY: Record<HousingPathId, { title: string; note: string }> = {
  home: {
    title: "Stay home",
    note: "No facility rent. Lifestyle stays what you entered.",
  },
  ccrc: {
    title: "CCRC",
    note: "Continuing-care rent from the start age. Lifestyle is cut while you live there.",
  },
  nursing: {
    title: "Nursing",
    note: "Nursing-home rent from the start age. Lifestyle is cut while you live there.",
  },
};

function headlineFor(result: HousingEstimate): string {
  if (result.longest === "tie") return "More than one path lasts through the same farthest age";
  if (result.longest === "home") return "Staying home lasts longest in this model";
  if (result.longest === "ccrc") return "The CCRC path lasts longest in this model";
  return "The nursing path lasts longest in this model";
}

function HousingResult({ result }: { result: HousingEstimate }) {
  const paths: HousingPath[] = [result.home, result.ccrc, result.nursing];
  return (
    <section id="housing-result" className="space-y-5">
      <div className="card border-gold/40 bg-gold/10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Later-life housing — three paths</p>
        <h2 className="mt-2 font-serif text-2xl text-pine">{headlineFor(result)}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/80">
          Same savings, spending, and income on every run. Only later-life housing changes. CCRC and nursing inflate
          with healthcare costs. How long still has the stacked housing cells if you want senior rental then nursing on
          one outlook.
        </p>
        <dl className="mt-5 grid gap-4 lg:grid-cols-3">
          {paths.map((path) => (
            <PathCard key={path.id} path={path} highlight={result.longest === path.id} />
          ))}
        </dl>
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

function PathCard({ path, highlight }: { path: HousingPath; highlight: boolean }) {
  const copy = PATH_COPY[path.id];
  const longevityHref = `/longevity?${inputToSearchParams(path.input).toString()}`;
  return (
    <div className={`rounded-xl border bg-paper-2/40 p-4 ${highlight ? "border-gold/50" : "border-pine/10"}`}>
      <dt className="text-xs uppercase tracking-wide text-muted">{copy.title}</dt>
      <dd className="mt-1 font-serif text-2xl text-ink">Age {path.fundedThroughAge}</dd>
      <p className="mt-1 text-sm text-ink/85">
        Nest egg to last: <strong>{formatMoney(path.nestEggNeededNow)}</strong>
      </p>
      <p className="mt-1 text-xs text-muted">
        {path.id === "home"
          ? copy.note
          : `${formatMoney(path.rentToday)} / year from age ${path.startAge}. ${copy.note}`}
      </p>
      <p className="mt-3 text-sm">
        <Link href={longevityHref} className="font-medium text-pine underline decoration-pine/30 underline-offset-2">
          Open this path in How long
        </Link>
      </p>
    </div>
  );
}
