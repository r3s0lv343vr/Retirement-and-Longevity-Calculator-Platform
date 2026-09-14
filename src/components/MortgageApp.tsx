"use client";

import { useEffect, useRef, useState } from "react";
import { AdSidebar, AdSlot } from "@/components/AdSlot";
import { MortgageCompileDownloadButton } from "@/components/MortgageCompileDownloadButton";
import { MortgageForm } from "@/components/MortgageForm";
import { calculatorAdGridClass } from "@/lib/ads";
import { formatMoney, formatPercent } from "@/lib/format";
import { MORTGAGE_DEFAULT, type MortgageInput } from "@/lib/mortgage/defaults";
import type { MortgageEstimate, MortgagePath, MortgageStatus } from "@/lib/mortgage/estimateMortgage";
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
            <MortgageResult result={result} />
            <MortgageCompileDownloadButton result={result} />
            <AdSlot placement="after-stats" />
          </>
        ) : null}
      </div>
      <AdSidebar />
    </div>
  );
}

const HEADLINE: Record<MortgageStatus, string> = {
  comfortable: "The house payment still leaves a buffer through year 10",
  buffered: "The year is short, but the investment pile covers the gap",
  tight: "Year one clears, then inflation or a later year gets tight",
  short: "Year one does not clear after tax, insurance, and life costs",
  depleted: "The pile is emptied while the house and life still overflow",
};

function snapshot(path: MortgagePath, year: number) {
  const snap = path.snapshots.find((row) => row.year === year);
  if (snap) return snap;
  const row = path.years.find((item) => item.year === year);
  if (!row) return null;
  return {
    year: row.year,
    housing: row.housing,
    insurance: row.insurance,
    leftover: row.leftover,
    pile: row.endingPile,
    pmi: row.pmi,
  };
}

function MortgageResult({ result }: { result: MortgageEstimate }) {
  const { primary, compare } = result;
  return (
    <section id="mortgage-result" className="space-y-5">
      <div className="card border-gold/40 bg-gold/10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Mortgage — year-by-year buffer</p>
        <h2 className="mt-2 font-serif text-2xl text-pine">{HEADLINE[result.status]}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/80">
          Principal and interest are {formatMoney(primary.monthlyPI)} a month. All-in housing in year one is about{" "}
          {formatMoney(primary.firstHousingMonthly)} a month. That is {formatPercent(primary.housingRatio, 0)} of
          take-home. Adding car and other loans makes {formatPercent(primary.obligationRatio, 0)}. These are household
          shares, not a lender approval.
        </p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Loan</dt>
            <dd className="mt-1 font-serif text-2xl text-ink">{formatMoney(primary.loanAmount)}</dd>
            <p className="mt-1 text-xs text-muted">
              {result.input.termYears} years at {formatPercent(result.input.annualRate, 2)}
            </p>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Interest over the loan</dt>
            <dd className="mt-1 font-serif text-2xl text-ink">{formatMoney(primary.totalInterest)}</dd>
            <p className="mt-1 text-xs text-muted">Paid off in year {primary.payoffYear} on this path.</p>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Pile at the end</dt>
            <dd className="mt-1 font-serif text-2xl text-ink">{formatMoney(primary.endingPile)}</dd>
            <p className="mt-1 text-xs text-muted">
              {primary.firstDrawYear
                ? `First draw in year ${primary.firstDrawYear}.`
                : "Not drawn to cover a short year."}
            </p>
          </div>
        </dl>
      </div>

      <div className="card">
        <h3 className="font-serif text-xl text-pine">Years 1, 5, and 10</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Insurance, tax, HOA, and living costs inflate. PMI drops when loan-to-value reaches 80%.
          {primary.pmiDropYear ? ` PMI ends in year ${primary.pmiDropYear}.` : ""}
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted">
                <th className="pb-2 font-medium">Year</th>
                <th className="pb-2 font-medium">Housing</th>
                <th className="pb-2 font-medium">Insurance</th>
                <th className="pb-2 font-medium">Leftover</th>
                <th className="pb-2 font-medium">Pile</th>
              </tr>
            </thead>
            <tbody>
              {[1, 5, 10].map((year) => {
                const row = snapshot(primary, year);
                if (!row) return null;
                return (
                  <tr key={year} className="border-t border-pine/10">
                    <td className="py-2">{year}</td>
                    <td>{formatMoney(row.housing)}</td>
                    <td>{formatMoney(row.insurance)}</td>
                    <td className={row.leftover < 0 ? "text-short" : ""}>{formatMoney(row.leftover)}</td>
                    <td>{formatMoney(row.pile)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {compare ? (
        <div className="card">
          <h3 className="font-serif text-xl text-pine">Compare</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Same income, life costs, and pile. Only the loan changes.
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <CompareCard title="This loan" path={primary} rate={result.input.annualRate} term={result.input.termYears} />
            <CompareCard
              title="Other loan"
              path={compare}
              rate={result.input.compareAnnualRate}
              term={result.input.compareTermYears}
            />
          </div>
        </div>
      ) : null}

      <div className="card">
        <h3 className="font-serif text-xl text-pine">Amortization</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">Yearly rollup. The PDF has the full table.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted">
                <th className="pb-2 font-medium">Year</th>
                <th className="pb-2 font-medium">Principal</th>
                <th className="pb-2 font-medium">Interest</th>
                <th className="pb-2 font-medium">PMI</th>
                <th className="pb-2 font-medium">Balance</th>
                <th className="pb-2 font-medium">Pile</th>
              </tr>
            </thead>
            <tbody>
              {primary.years.map((row) => (
                <tr key={row.year} className="border-t border-pine/10">
                  <td className="py-1.5">{row.year}</td>
                  <td>{formatMoney(row.principal)}</td>
                  <td>{formatMoney(row.interest)}</td>
                  <td>{formatMoney(row.pmi)}</td>
                  <td>{formatMoney(row.endingBalance)}</td>
                  <td>{formatMoney(row.endingPile)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

function CompareCard({
  title,
  path,
  rate,
  term,
}: {
  title: string;
  path: MortgagePath;
  rate: number;
  term: number;
}) {
  return (
    <div className="rounded-xl border border-pine/10 bg-paper/60 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">{title}</p>
      <p className="mt-2 font-serif text-2xl text-ink">{formatMoney(path.monthlyPI)} P&I</p>
      <p className="mt-1 text-sm text-muted">
        {term} years · {formatPercent(rate, 2)} · interest {formatMoney(path.totalInterest)}
      </p>
      <p className="mt-3 text-sm text-ink">
        Year-one housing {formatMoney(path.firstHousingMonthly)} / month. Leftover{" "}
        {formatMoney(path.years[0]?.leftover ?? 0)} in year one.
      </p>
    </div>
  );
}
