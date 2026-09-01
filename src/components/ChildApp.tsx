"use client";

import { useEffect, useRef, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import { ChildForm } from "@/components/ChildForm";
import { CHILD_DEFAULT } from "@/lib/child/defaults";
import type { ChildEstimate, ChildPot } from "@/lib/child/estimateChild";
import type { ChildInput } from "@/lib/child/defaults";
import { formatMoney } from "@/lib/format";
import { readChildFromLocation, writeChildUrl } from "@/lib/child/url";

export function ChildApp() {
  const [values, setValues] = useState<ChildInput>(CHILD_DEFAULT);
  const [result, setResult] = useState<ChildEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const urlReady = useRef(false);

  function changeValues(next: ChildInput) {
    setValues(next);
    if (urlReady.current) writeChildUrl(next);
  }

  async function calculate(nextValues?: ChildInput) {
    const payload = nextValues ?? values;
    if (nextValues) setValues(nextValues);
    writeChildUrl(payload);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/child", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as ChildEstimate & { error?: string; errors?: string[] };
      if (!response.ok) {
        setError(data.errors?.join(" ") || data.error || "Could not run the estimate.");
        setResult(null);
        return;
      }
      setResult(data);
      requestAnimationFrame(() => {
        document.getElementById("child-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fromUrl = readChildFromLocation();
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
        <ChildForm
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
            <ChildResult result={result} />
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

function potNote(pot: ChildPot, saveLabel: string): string {
  if (pot.costYears <= 0) return "No remaining cost years on this pot.";
  const window = `Ages ${pot.firstCostAge}–${pot.lastCostAge} (${pot.costYears} year${pot.costYears === 1 ? "" : "s"}).`;
  if (pot.alreadyEnough) return `${window} What you have is enough in this model.`;
  if (pot.yearsToSave <= 0) return `${window} Full-time saving years are over, so this is a nest-egg gap.`;
  return `${window} Extra yearly saving ${saveLabel} would close the gap.`;
}

function ChildResult({ result }: { result: ChildEstimate }) {
  return (
    <section id="child-result" className="space-y-5">
      <div className="card border-gold/40 bg-gold/10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Two nest eggs — raising and university</p>
        <h2 className="mt-2 font-serif text-2xl text-pine">What it takes for this child</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/80">
          School and co-curricular through university start, then university as a second pot. Combined need today is{" "}
          <strong>{formatMoney(result.combinedNeeded)}</strong>. You have {formatMoney(result.combinedHave)} already
          split across the two pots.
        </p>
        <dl className="mt-5 grid gap-4 lg:grid-cols-2">
          <PotCard
            title="Through 18"
            pot={result.raising}
            have={result.input.raisingSavings}
            note={potNote(result.raising, "until university starts")}
          />
          <PotCard
            title="University"
            pot={result.university}
            have={result.input.universitySavings}
            note={potNote(result.university, "until university starts")}
          />
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

function PotCard({ title, pot, have, note }: { title: string; pot: ChildPot; have: number; note: string }) {
  return (
    <div className="rounded-xl border border-pine/10 bg-paper-2/40 p-4">
      <dt className="text-xs uppercase tracking-wide text-muted">{title}</dt>
      <dd className="mt-1 font-serif text-2xl text-ink">{formatMoney(pot.nestEggNeededNow)}</dd>
      <p className="mt-1 text-xs text-muted">Nest egg needed today.</p>
      <p className="mt-3 text-sm text-ink/85">
        You have <strong>{formatMoney(have)}</strong>
        {pot.alreadyEnough
          ? " — already enough."
          : ` — ${formatMoney(pot.additionalNestEgg)} more, or ${formatMoney(pot.additionalAnnualSavings)} extra / year.`}
      </p>
      {pot.depletedAtAge !== null ? (
        <p className="mt-2 text-sm text-short">This pot runs out at age {pot.depletedAtAge} with what you have now.</p>
      ) : null}
      <p className="mt-2 text-xs text-muted">{note}</p>
    </div>
  );
}
