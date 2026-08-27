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
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_180px]">
      <div className="space-y-8">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
          <CalculatorForm
            values={values}
            onChange={setValues}
            onSubmit={calculate}
            loading={loading}
            error={error}
          />
          <div className="space-y-4">
            <aside className="rounded-xl border border-pine/10 bg-white/70 p-5 text-sm leading-relaxed text-muted">
              <h2 className="font-serif text-lg text-pine">How this differs</h2>
              <p className="mt-2">
                Most calculators draw a straight spending line and call it a plan. Nestspan splits lifestyle from
                healthcare, lets costs swell in later decades, and credits part-time work only for the years you
                actually work.
              </p>
              <p className="mt-3">
                The engine projects <strong className="text-ink">{yearCount} years</strong> on the server — one pass
                with real-world cost curves, and one straight-line comparison so you can see the gap.
              </p>
            </aside>
            <AdSlot placement="mid-form" className="py-6" />
          </div>
        </section>

        {result ? (
          <>
            <AdSlot placement="pre-outlook" className="py-4" />
            <OutlookResults result={result} />
          </>
        ) : null}
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-6">
          <AdSlot placement="sidebar" className="min-h-[600px] py-8" />
        </div>
      </div>
    </div>
  );
}
