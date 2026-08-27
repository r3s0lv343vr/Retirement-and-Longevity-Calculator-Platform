"use client";

import { AdSlot } from "@/components/AdSlot";
import { OutlookChart } from "@/components/OutlookChart";
import type { ComfortEstimate, ProjectionResult } from "@/lib/engine";
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
  const { outlook, years, warnings, comfort } = result;
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

      {comfort ? <ComfortEstimateCard comfort={comfort} currentSavings={result.input.currentSavings} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Healthcare & housing share"
          value={formatPercent(outlook.healthcareShare)}
          note="Medical care, long-term support, and later-life facility rent."
        />
        <StatCard
          label="Peak care year"
          value={outlook.peakHealthcareAge ? `Age ${outlook.peakHealthcareAge}` : "—"}
          note={
            outlook.peakHealthcareSpend
              ? `${formatMoney(outlook.peakHealthcareSpend)} that year, including facility rent`
              : ""
          }
        />
        <StatCard
          label="Later-life housing (total)"
          value={formatMoney(outlook.totalHousingSpend)}
          note="Senior rental, nursing home, or continuing-care rent over the plan."
        />
        <StatCard
          label="Part-time income (total)"
          value={formatMoney(outlook.partTimeTotal)}
          note="Inflated side-hustle or phased-work wages after full-time ends."
        />
      </div>

      <AdSlot placement="after-stats" />
      <AdSlot placement="in-outlook" />

      <div className="card">
        <h3 className="font-serif text-xl text-pine">Portfolio vs. changing costs</h3>
        <p className="mb-4 mt-1 text-sm text-muted">
          Bars are annual spending in retirement. Darker bars are healthcare, long-term care, and facility rent.
        </p>
        <OutlookChart years={years} />
      </div>

      <AdSlot placement="after-chart" />

      <div className="card border-gold/40 bg-gold/10">
        <h3 className="font-serif text-xl text-pine">Not a straight line</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink/85">
          A model that holds spending flat except for CPI would say you last until age{" "}
          <strong>{outlook.straightLineFundedThroughAge}</strong>
          {outlook.straightLineEndingBalance > 0 ? ` with ${formatMoney(outlook.straightLineEndingBalance)} left` : ""}.
          Accounting for healthcare inflation, age-driven medical costs, lifestyle phases, later-life housing, and care, this
          plan funds through age <strong>{outlook.fundedThroughAge}</strong>
          {outlook.longevityGapYears > 0
            ? ` — ${outlook.longevityGapYears} year${outlook.longevityGapYears === 1 ? "" : "s"} sooner.`
            : "."}
        </p>
      </div>

      <AdSlot placement="after-comparison" />

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
                <th className="py-2 pr-3 font-medium">Housing</th>
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
                  <td className="py-2 pr-3">{formatMoney(row.housingSpend)}</td>
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

function ComfortEstimateCard({
  comfort,
  currentSavings,
}: {
  comfort: ComfortEstimate;
  currentSavings: number;
}) {
  const saveLine =
    comfort.additionalNestEgg <= 0
      ? "Your current nest egg is at or above this comfortable estimate, given the other assumptions on the form."
      : comfort.yearsToRetirement > 0
        ? `That is ${formatMoney(comfort.additionalNestEgg)} more than the ${formatMoney(currentSavings)} entered. Saving about ${formatMoney(comfort.additionalAnnualSavings)} extra per year until retirement would close the gap in this model.`
        : `That is ${formatMoney(comfort.additionalNestEgg)} more than the ${formatMoney(currentSavings)} entered. Because retirement is already here, the gap is a nest-egg shortfall rather than extra yearly saving.`;

  return (
    <section className="card border-pine/20">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Suggested estimate</p>
      <h3 className="mt-2 font-serif text-2xl text-pine">Comfortable living — what to save toward</h3>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
        A national-style planning figure, not a quote for your city. It uses the higher of your lifestyle spending and
        a $65,000 comfort floor, adds a 10% buffer, and keeps healthcare from falling below a typical premium-plus-care
        amount
        {comfort.usedHousingPlaceholder
          ? `, plus independent living at ${formatMoney(comfort.placeholderHousingAnnual)} a year starting at age ${comfort.placeholderHousingStartAge} because facility rent was left at zero`
          : ", plus the later-life housing rent you entered"}
        .
      </p>
      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Comfortable budget / year</dt>
          <dd className="mt-1 font-serif text-2xl text-ink">{formatMoney(comfort.suggestedAnnualBudgetToday)}</dd>
          <p className="mt-1 text-xs text-muted">
            {formatMoney(comfort.suggestedLifestyleToday)} lifestyle + {formatMoney(comfort.suggestedHealthcareToday)}{" "}
            healthcare, in today’s dollars.
          </p>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Nest egg to fund it</dt>
          <dd className="mt-1 font-serif text-2xl text-ink">{formatMoney(comfort.nestEggNeededNow)}</dd>
          <p className="mt-1 text-xs text-muted">
            Savings needed today to last through your plan age with a small remaining cushion.
          </p>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Extra to save / year</dt>
          <dd className="mt-1 font-serif text-2xl text-ink">
            {comfort.additionalNestEgg <= 0 ? "$0" : formatMoney(comfort.additionalAnnualSavings)}
          </dd>
          <p className="mt-1 text-xs text-muted">On top of the annual savings already on the form, until full-time work ends.</p>
        </div>
      </dl>
      <p className="mt-4 text-sm leading-relaxed text-ink/85">{saveLine}</p>
      {comfort.usedHousingPlaceholder ? (
        <p className="mt-2 text-xs text-muted">
          Housing placeholder is included in the nest-egg figure. Enter your own senior, nursing, or CCRC rent to replace
          it.
        </p>
      ) : null}
    </section>
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

