"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AdSidebar, AdSlot } from "@/components/AdSlot";
import { LocalPlanControls } from "@/components/payoff/LocalPlanControls";
import { PayoffForm } from "@/components/payoff/PayoffForm";
import { PayoffResults } from "@/components/payoff/PayoffResults";
import { calculatorAdGridClass } from "@/lib/ads";
import {
  PAYOFF_DEFAULT,
  defaultStrategies,
  deletePayoffPlan,
  exportPayoffPlan,
  mergePayoffInput,
  readPayoffFromLocation,
  readPayoffPlan,
  runPayoffStudio,
  validatePayoffInput,
  validateStrategies,
  writePayoffPlan,
  writePayoffUrl,
  type PayoffMortgageInput,
  type Scenario,
} from "@/lib/mortgage/payoff";

export function PayoffApp() {
  const [values, setValues] = useState<PayoffMortgageInput>(PAYOFF_DEFAULT);
  const [strategies, setStrategies] = useState<Scenario[]>(defaultStrategies);
  const [selectedId, setSelectedId] = useState("plan-a");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const urlReady = useRef(false);

  function changeValues(next: PayoffMortgageInput) {
    const merged = mergePayoffInput(next);
    setValues(merged);
    if (urlReady.current) writePayoffUrl(merged);
  }

  const errors = useMemo(
    () => [...validatePayoffInput(values), ...validateStrategies(strategies)],
    [values, strategies],
  );

  const studio = useMemo(() => {
    if (errors.length > 0) return null;
    return runPayoffStudio(values, strategies, selectedId);
  }, [values, strategies, selectedId, errors.length]);

  useEffect(() => {
    const stored = readPayoffPlan();
    const fromUrl = readPayoffFromLocation();
    if (stored) {
      setValues(fromUrl ?? stored.input);
      setStrategies(stored.strategies);
      setSelectedId(stored.selectedId);
      setSavedAt(stored.savedAt);
    } else if (fromUrl) {
      setValues(fromUrl);
    }
    urlReady.current = true;
    if (fromUrl) writePayoffUrl(fromUrl);
  }, []);

  return (
    <div className={calculatorAdGridClass()}>
      <div className="min-w-0 space-y-6">
        <AdSlot placement="after-intro" />
        <PayoffForm
          values={values}
          strategies={strategies}
          selectedId={selectedId}
          scheduledPayment={studio?.mortgage.scheduledPayment ?? 0}
          onChange={changeValues}
          onStrategies={setStrategies}
          onSelect={setSelectedId}
        />
        <AdSlot placement="mid-form" />
        {errors.length > 0 ? (
          <p className="rounded-xl border border-short/30 bg-short/10 px-4 py-3 text-sm text-short" role="alert">
            {errors.join(" ")}
          </p>
        ) : null}
        {studio ? (
          <>
            <AdSlot placement="pre-outlook" />
            <PayoffResults
              studio={studio}
              onUseFreedomExtra={(amount) => changeValues({ ...values, extraMonthly: amount })}
            />
            <LocalPlanControls
              savedAt={savedAt}
              onSave={() => {
                writePayoffPlan(values, strategies, selectedId);
                setSavedAt(new Date().toISOString());
              }}
              onLoad={() => {
                const stored = readPayoffPlan();
                if (!stored) return;
                setValues(stored.input);
                setStrategies(stored.strategies);
                setSelectedId(stored.selectedId);
                setSavedAt(stored.savedAt);
                writePayoffUrl(stored.input);
              }}
              onDelete={() => {
                deletePayoffPlan();
                setSavedAt(null);
              }}
              onExport={() => {
                const blob = new Blob([exportPayoffPlan(values, strategies, selectedId)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "runaway-mortgage-payoff-plan.json";
                link.click();
                URL.revokeObjectURL(url);
              }}
            />
            <AdSlot placement="after-stats" />
          </>
        ) : null}
      </div>
      <AdSidebar />
    </div>
  );
}
