"use client";

import { useMemo, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import { CalculatorForm } from "@/components/CalculatorForm";
import { OutlookResults } from "@/components/OutlookResults";
import { DEFAULT_INPUT } from "@/lib/engine";
import type { CalculatorInput, ProjectionResult } from "@/lib/engine";

export function CalculatorApp() {
  const [values, setValues] = useState<CalculatorInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<ProjectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function calculate() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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
        </aside>

        <AdSlot placement="after-intro" />

        <CalculatorForm
          values={values}
          onChange={setValues}
          onSubmit={calculate}
          loading={loading}
          error={error}
        />

        <AdSlot placement="mid-form" />

        {result ? (
          <>
            <AdSlot placement="pre-outlook" />
            <OutlookResults result={result} />
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
