"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import { CalculatorForm } from "@/components/CalculatorForm";
import { OutlookResults } from "@/components/OutlookResults";
import { DEFAULT_INPUT, adoptComfortBudget, sameSpendAmounts } from "@/lib/engine";
import type { CalculatorInput, ProjectionResult } from "@/lib/engine";
import { readScenarioFromLocation, writeScenarioUrl } from "@/lib/scenarioUrl";

type AdoptedComfortBudget = {
  lifestyle: number;
  healthcare: number;
};

export function CalculatorApp() {
  const [values, setValues] = useState<CalculatorInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<ProjectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [adoptingComfort, setAdoptingComfort] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adoptedBudget, setAdoptedBudget] = useState<AdoptedComfortBudget | null>(null);
  const urlReady = useRef(false);

  function changeValues(next: CalculatorInput) {
    setValues(next);
    if (urlReady.current) writeScenarioUrl(next);
    if (adoptedBudget && !sameSpendAmounts(next, adoptedBudget.lifestyle, adoptedBudget.healthcare)) {
      setAdoptedBudget(null);
    }
  }

  async function calculate(nextValues?: CalculatorInput) {
    const payload = nextValues ?? values;
    if (nextValues) setValues(nextValues);
    writeScenarioUrl(payload);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as ProjectionResult & { error?: string; errors?: string[] };
      if (!response.ok) {
        setError(data.errors?.join(" ") || data.error || "Could not run the projection.");
        setResult(null);
        return;
      }
      setResult(data);
      requestAnimationFrame(() => {
        document.getElementById("outlook")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    // Shared links hydrate once from the query string.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intended one-shot
  }, []);

  async function adoptComfort() {
    if (!result) return;
    const next = adoptComfortBudget(result.input);
    setAdoptedBudget({
      lifestyle: next.lifestyleSpendToday,
      healthcare: next.healthcareSpendToday,
    });
    setAdoptingComfort(true);
    try {
      await calculate(next);
    } finally {
      setAdoptingComfort(false);
    }
  }

  const yearCount = useMemo(() => values.planToAge - values.currentAge + 1, [values]);

  return (
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_160px]">
      <div className="min-w-0 space-y-6">
        <aside className="card text-sm leading-relaxed text-muted">
          <h2 className="font-serif text-lg text-pine">How this differs</h2>
          <p className="mt-2">
            Most calculators draw a straight spending line and call it a plan. This one splits lifestyle from
            healthcare, lets costs swell in later decades, and credits part-time work only for the years you actually
            work.
          </p>
          <p className="mt-3">
            The engine projects <strong className="text-ink">{yearCount} years</strong> on the server — one pass with
            real-world cost curves, and one straight-line comparison so you can see the gap.
          </p>
          <p className="mt-3">
            Your numbers stay in the address bar so you can bookmark or send this scenario. Nothing is stored on a
            server.
          </p>
        </aside>

        <AdSlot placement="after-intro" />

        <CalculatorForm
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
            <OutlookResults
              result={result}
              adoptedBudget={adoptedBudget}
              onAdoptComfort={() => void adoptComfort()}
              adoptingComfort={adoptingComfort}
            />
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
