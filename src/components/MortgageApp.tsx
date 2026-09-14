"use client";

import { useEffect, useRef, useState } from "react";
import { AdSidebar, AdSlot } from "@/components/AdSlot";
import { MortgageCompileDownloadButton } from "@/components/MortgageCompileDownloadButton";
import { MortgageForm } from "@/components/MortgageForm";
import { MortgageResult } from "@/components/MortgageResult";
import { calculatorAdGridClass } from "@/lib/ads";
import { MORTGAGE_DEFAULT, type MortgageInput } from "@/lib/mortgage/defaults";
import { mergeMortgageInput } from "@/lib/mortgage/estimateMortgage";
import type { MortgageEstimate } from "@/lib/mortgage/estimateMortgage";
import { readMortgageFromLocation, writeMortgageUrl } from "@/lib/mortgage/url";

export function MortgageApp() {
  const [values, setValues] = useState<MortgageInput>(MORTGAGE_DEFAULT);
  const [result, setResult] = useState<MortgageEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const urlReady = useRef(false);

  function changeValues(next: MortgageInput) {
    setValues(next);
    if (urlReady.current) writeMortgageUrl(next);
  }

  async function calculate(nextValues?: MortgageInput) {
    const payload = nextValues ?? values;
    if (nextValues) setValues(nextValues);
    writeMortgageUrl(payload);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/mortgage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as MortgageEstimate & { error?: string; errors?: string[] };
      if (!response.ok) {
        setError(data.errors?.join(" ") || data.error || "Could not run the estimate.");
        setResult(null);
        return;
      }
      setResult(data);
      requestAnimationFrame(() => {
        document.getElementById("mortgage-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fromUrl = readMortgageFromLocation();
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
        <MortgageForm
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
            <MortgageResult
              result={result}
              onExtraMonthly={(amount) => void calculate(mergeMortgageInput({ ...values, extraMonthly: amount }))}
            />
            <MortgageCompileDownloadButton result={result} />
            <AdSlot placement="after-stats" />
          </>
        ) : null}
      </div>
      <AdSidebar />
    </div>
  );
}
