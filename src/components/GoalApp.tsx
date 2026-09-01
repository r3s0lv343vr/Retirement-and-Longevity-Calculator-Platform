"use client";

import { useEffect, useRef, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import { GoalForm } from "@/components/GoalForm";
import { GOAL_DEFAULT } from "@/lib/goal/defaults";
import type { GoalEstimate, GoalStatus } from "@/lib/goal/estimateGoal";
import type { GoalInput } from "@/lib/goal/defaults";
import { formatMoney } from "@/lib/format";
import { readGoalFromLocation, writeGoalUrl } from "@/lib/goal/url";

export function GoalApp() {
  const [values, setValues] = useState<GoalInput>(GOAL_DEFAULT);
  const [result, setResult] = useState<GoalEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const urlReady = useRef(false);

  function changeValues(next: GoalInput) {
    setValues(next);
    if (urlReady.current) writeGoalUrl(next);
  }

  async function calculate(nextValues?: GoalInput) {
    const payload = nextValues ?? values;
    if (nextValues) setValues(nextValues);
    writeGoalUrl(payload);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as GoalEstimate & { error?: string; errors?: string[] };
      if (!response.ok) {
        setError(data.errors?.join(" ") || data.error || "Could not run the estimate.");
        setResult(null);
        return;
      }
      setResult(data);
      requestAnimationFrame(() => {
        document.getElementById("goal-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fromUrl = readGoalFromLocation();
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
        <GoalForm
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
            <GoalResult result={result} />
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

const HEADLINE: Record<GoalStatus, string> = {
  intact: "The earmarked pot survives and the goal is funded",
  short: "Expenses do not raid the pot, but the planned saving is not enough",
  reached_raided: "The pot was raided, but it still covers the goal",
  compromised: "Competing expenses dip into the pot; the goal is short",
  dissolved: "Competing expenses dissolve the goal pot before you get there",
};

function goalLabel(result: GoalEstimate): string {
  return result.input.goalName.trim() || "this goal";
}

function GoalResult({ result }: { result: GoalEstimate }) {
  return (
    <section id="goal-result" className="space-y-5">
      <div className="card border-gold/40 bg-gold/10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Goal survival — earmarked pot last</p>
        <h2 className="mt-2 font-serif text-2xl text-pine">{HEADLINE[result.status]}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/80">
          For {goalLabel(result)}, the pot needs {formatMoney(result.neededAtTarget)} in {result.input.yearsToGoal}{" "}
          year{result.input.yearsToGoal === 1 ? "" : "s"}. If competing expenses had never touched it, it would have
          been {formatMoney(result.intendedEndingGoal)}.
        </p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Goal pot at the target</dt>
            <dd className="mt-1 font-serif text-2xl text-ink">{formatMoney(result.endingGoal)}</dd>
            <p className="mt-1 text-xs text-muted">
              {result.reachedGoal
                ? "Covers the inflated goal amount."
                : `${formatMoney(result.goalShortfall)} short of the goal.`}
            </p>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Other savings left</dt>
            <dd className="mt-1 font-serif text-2xl text-ink">{formatMoney(result.endingOther)}</dd>
            <p className="mt-1 text-xs text-muted">
              {result.dippedOther
                ? result.firstYearDippedOther
                  ? `First dip in year ${result.firstYearDippedOther}.`
                  : "This pot was used to protect the goal."
                : "Not raided."}
            </p>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Goal pot raided?</dt>
            <dd className="mt-1 font-serif text-2xl text-ink">{result.dippedGoal ? "Yes" : "No"}</dd>
            <p className="mt-1 text-xs text-muted">
              {result.yearGoalDepleted
                ? `Dissolved in year ${result.yearGoalDepleted}.`
                : result.firstYearDippedGoal
                  ? `First dip in year ${result.firstYearDippedGoal}.`
                  : "Emergency and other savings stood in front."}
            </p>
          </div>
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
