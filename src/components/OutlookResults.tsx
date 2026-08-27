"use client";

import { AdSlot } from "@/components/AdSlot";
import { OutlookChart } from "@/components/OutlookChart";
import type { ProjectionResult } from "@/lib/engine";
import { formatMoney, formatPercent } from "@/lib/format";

type Props = {
  result: ProjectionResult;
};

const STATUS_STYLES: Record<string, string> = {
  strong: "bg-strong/10 text-strong border-strong/20",
  watchful: "bg-watch/10 text-watch border-watch/20",
  "at-risk": "bg-risk/10 text-risk border-risk/20",
  shortfall: "bg-short/10 text-short border-short/20",
};

const PHASE_LABEL: Record<string, string> = {
  working: "Working",
  "go-go": "Go-go",
  "slow-go": "Slow-go",
  "no-go": "No-go",
};

export function OutlookResults({ result }: Props) {
  const { outlook, years, warnings } = result;
  const retiredYears = years.filter((y) => y.phase !== "working");
  const sampleYears = retiredYears.filter((_, i, arr) => i % 5 === 0 || i === arr.length - 1);

  return (
    <section id="outlook" className="space-y-6">
      <header className={`overflow-hidden rounded-2xl border p-6 sm:p-8 ${STATUS_STYLES[outlook.status]}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em]">Retirement Longevity Outlook</p>
        <h2 className="mt-2 font-serif text-3xl leading-tight text-ink sm:text-4xl">{outlook.title}</h2>
        <p className="mt-3 max-w-2xl text-base text-ink/80">{outlook.summary}</p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <Metric label="Funded through age" value={String(outlook.fundedThroughAge)} />
          <Metric
            label="Balance at target"
            value={outlook.depleted ? "Depleted" : formatMoney(outlook.endingBalance)}
          />
          <Metric label="Years of retirement covered" value={`${outlook.yearsCovered} of ${outlook.yearsInRetirement}`} />
        </dl>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Healthcare share of retirement spending"
          value={formatPercent(outlook.healthcareShare)}
          note="Includes long-term care. This is why a flat withdrawal rate misleads."
        />
        <StatCard
          label="Peak medical year"
          value={outlook.peakHealthcareAge ? `Age ${outlook.peakHealthcareAge}` : "—"}
          note={outlook.peakHealthcareSpend ? formatMoney(outlook.peakHealthcareSpend) + " that year" : ""}
        />
        <StatCard
          label="Part-time income (total)"
          value={formatMoney(outlook.partTimeTotal)}
          note="Inflated side-hustle or phased-work wages after full-time ends."
        />
      </div>

      <AdSlot placement="in-outlook" className="mx-auto w-full max-w-[300px] py-4" />

      <div className="card">
        <h3 className="font-serif text-xl text-pine">Portfolio vs. changing costs</h3>
        <p className="mb-4 mt-1 text-sm text-muted">
          Bars are annual spending in retirement. Darker bars are healthcare and long-term care — they climb even when
          lifestyle spending eases.
        </p>
        <OutlookChart years={years} />
      </div>

      <div className="card border-gold/40 bg-gold/10">
        <h3 className="font-serif text-xl text-pine">Not a straight line</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink/85">
          A model that holds spending flat except for CPI would say you last until age{" "}
          <strong>{outlook.straightLineFundedThroughAge}</strong>
          {outlook.straightLineEndingBalance > 0 ? ` with ${formatMoney(outlook.straightLineEndingBalance)} left` : ""}.
          Accounting for healthcare inflation, age-driven medical costs, lifestyle phases, and later-life care, this
          plan funds through age <strong>{outlook.fundedThroughAge}</strong>
          {outlook.longevityGapYears > 0
            ? ` — ${outlook.longevityGapYears} year${outlook.longevityGapYears === 1 ? "" : "s"} sooner.`
            : "."}
        </p>
      </div>

      {warnings.length > 0 ? (
        <ul className="card list-disc space-y-1 px-8 text-sm text-muted">
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}

      <details className="card">
        <summary className="cursor-pointer font-serif text-xl text-pine">Year-by-year snapshot</summary>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-pine/15 text-muted">
                <th className="py-2 pr-3 font-medium">Age</th>
                <th className="py-2 pr-3 font-medium">Phase</th>
                <th className="py-2 pr-3 font-medium">Lifestyle</th>
                <th className="py-2 pr-3 font-medium">Healthcare</th>
                <th className="py-2 pr-3 font-medium">Income</th>
                <th className="py-2 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {sampleYears.map((row) => (
                <tr key={row.age} className="border-b border-pine/8">
                  <td className="py-2 pr-3">{row.age}</td>
                  <td className="py-2 pr-3">{PHASE_LABEL[row.phase]}</td>
                  <td className="py-2 pr-3">{formatMoney(row.lifestyleSpend)}</td>
                  <td className="py-2 pr-3">{formatMoney(row.healthcareSpend + row.longTermCareSpend)}</td>
                  <td className="py-2 pr-3">{formatMoney(row.guaranteedIncome + row.partTimeIncome)}</td>
                  <td className="py-2 font-medium">{formatMoney(row.endBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-muted">Showing every fifth retirement year. Full series is computed on the server.</p>
        </div>
      </details>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide opacity-80">{label}</dt>
      <dd className="mt-1 font-serif text-2xl text-ink">{value}</dd>
    </div>
  );
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="card p-5">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-serif text-2xl text-pine">{value}</p>
      {note ? <p className="mt-2 text-xs text-muted">{note}</p> : null}
    </article>
  );
}

