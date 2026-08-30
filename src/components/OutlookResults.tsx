"use client";

import { AdSlot } from "@/components/AdSlot";
import { CompileDownloadButton } from "@/components/CompileDownloadButton";
import { OutlookChart } from "@/components/OutlookChart";
import { PlanSnapshotCard } from "@/components/PlanSnapshotCard";
import { WhatIfCompare } from "@/components/WhatIfCompare";
import type { ComfortEstimate, PlanSnapshot, ProjectionResult } from "@/lib/engine";
import { fundedThroughDeltaCopy, snapshotFromOutlook } from "@/lib/engine";
import { formatMoney, formatMonths, formatPercent } from "@/lib/format";

type AdoptedComfortBudget = {
  lifestyle: number;
  healthcare: number;
};

type Props = {
  result: ProjectionResult;
  adoptedBudget?: AdoptedComfortBudget | null;
  onAdoptComfort?: () => void;
  adoptingComfort?: boolean;
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

function SectionBreak({ label, note }: { label: string; note: string }) {
  return (
    <div className="pt-2" role="separator" aria-label={label}>
      <div className="flex items-center gap-3">
        <div className="h-1.5 min-w-8 flex-1 rounded-full bg-pine" />
        <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-pine">{label}</p>
        <div className="h-1.5 min-w-8 flex-1 rounded-full bg-pine" />
      </div>
      <p className="mt-2 text-center text-sm text-muted">{note}</p>
    </div>
  );
}

export function OutlookResults({ result, adoptedBudget = null, onAdoptComfort, adoptingComfort = false }: Props) {
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

      {comfort ? (
        <ComfortEstimateCard
          comfort={comfort}
          currentSavings={result.input.currentSavings}
          thisRun={snapshotFromOutlook(outlook)}
          adoptedBudget={adoptedBudget}
          onAdopt={onAdoptComfort}
          adopting={adoptingComfort}
        />
      ) : null}

      <SectionBreak
        label="Your entered plan"
        note="The figures below use the amounts on the form. They are not the comfortable-living suggestion."
      />

      <WhatIfCompare result={result} />

      <HouseholdSurvivorCard result={result} />

      <ClaimingCompareCard result={result} />

      <div className="space-y-4">
        <div className="card flex flex-col gap-1 p-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Nest egg + later income</p>
            <p className="mt-1 text-sm text-muted">
              From your entered plan: {formatMoney(outlook.nestEggAtRetirement)} at retirement +{" "}
              {formatMoney(outlook.retirementIncomeTotal)} after full-time work ends
            </p>
          </div>
          <p className="font-serif text-3xl text-pine">{formatMoney(outlook.fundingTotal)}</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownCard
          title="Nest egg at retirement"
          total={outlook.nestEggAtRetirement}
          note={
            outlook.nestEggYears > 0
              ? result.input.savingsGrowWithInflation
                ? `Total future value at age ${result.input.retirementAge}: current savings grown as a lump, plus annual savings that rise with inflation (${outlook.nestEggYears} years at ${(result.input.preRetirementReturn * 100).toFixed(1)}%).`
                : `Total future value at age ${result.input.retirementAge}: current savings grown as a lump, plus annual savings as an ordinary annuity (${outlook.nestEggYears} years at ${(result.input.preRetirementReturn * 100).toFixed(1)}%).`
              : "Full-time work has already ended, so this is the savings on hand today."
          }
          rows={[
            { label: "Future value of current savings", value: outlook.nestEggLump },
            {
              label: result.input.savingsGrowWithInflation
                ? "Growing annuity of annual savings"
                : "Annuity of annual savings",
              value: outlook.nestEggAnnuity,
            },
          ]}
        />
        <BreakdownCard
          title="Income after full-time work ends"
          total={outlook.retirementIncomeTotal}
          note="Social Security, pension, and phased-work wages through the last funded year, plus extra savings during the work window as an ordinary annuity (or amount × years if the rate is 0%)."
          rows={[
            { label: "Social Security", value: outlook.socialSecurityTotal },
            { label: "Pension", value: outlook.pensionTotal },
            { label: "Part-time / side-hustle wages", value: outlook.partTimeWages },
            { label: "Extra savings during phased work", value: outlook.partTimeInvested },
          ]}
        />
        <BreakdownCard
          title="All spending through last funded year"
          total={outlook.totalRetirementSpend}
          note={`Lifestyle plus healthcare through age ${outlook.fundedThroughAge}. Healthcare is only part of this total. Nest egg plus later income is ${formatMoney(outlook.fundingTotal)}; remaining-balance growth in retirement covers some of the difference.`}
          rows={[
            { label: "Lifestyle", value: outlook.totalLifestyleSpend },
            { label: "Routine healthcare", value: outlook.totalHealthcareSpend },
            { label: "Long-term care", value: outlook.totalLongTermCareSpend },
            { label: "Later-life facility rent", value: outlook.totalHousingSpend },
          ]}
        />
        <BreakdownCard
          title="Healthcare and care"
          total={outlook.totalMedicalSpend}
          note={`Medical slice only — ${formatPercent(outlook.healthcareShare)} of all spending. Routine care uses medical inflation and age steps; long-term care starts at the age you set; facility rent is later-life housing only.`}
          rows={[
            { label: "Routine healthcare", value: outlook.totalHealthcareSpend },
            { label: "Long-term care", value: outlook.totalLongTermCareSpend },
            { label: "Later-life facility rent", value: outlook.totalHousingSpend },
          ]}
        />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Healthcare & housing share"
          value={formatPercent(outlook.healthcareShare)}
          note={
            outlook.totalHousingSpend > 0
              ? "Medical care, long-term support, and later-life facility rent."
              : "Medical care and long-term support over the funded years."
          }
        />
        <StatCard
          label="Peak care year"
          value={outlook.peakHealthcareAge ? `Age ${outlook.peakHealthcareAge}` : "—"}
          note={
            outlook.peakHealthcareSpend
              ? outlook.totalHousingSpend > 0
                ? `${formatMoney(outlook.peakHealthcareSpend)} that year, including facility rent`
                : `${formatMoney(outlook.peakHealthcareSpend)} that year in healthcare and long-term care`
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
          note={
            result.input.partTimeAnnualInvestment > 0
              ? "Wages during the window, plus extra savings as an ordinary annuity (or amount × years if the rate is 0%)."
              : "Inflated side-hustle or phased-work wages after full-time ends."
          }
        />
      </div>

      <AdSlot placement="after-stats" />
      <AdSlot placement="in-outlook" />

      <div className="card">
        <h3 className="font-serif text-xl text-pine">Portfolio vs. changing costs</h3>
        <p className="mb-4 mt-1 text-sm leading-relaxed text-muted">
          The green line is the nest egg. The dollar figure at the top left is the <strong className="font-medium text-ink/70">peak portfolio</strong>, not a year of spending.
          Bars are that year’s drawdown, drawn on a smaller scale so both fit: beige is total spending, brown is
          healthcare, long-term care, and facility rent. A brown step-up around 85 is usually long-term care starting
          and medical costs getting heavier. If the line reaches the axis, savings are depleted.
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
        <p className="mt-3 text-sm leading-relaxed text-ink/85">
          The same plan with a weak first decade — {(outlook.badDecadeReturn * 100).toFixed(1)}% a year for the first
          10 years of retirement, then your usual {(result.input.postRetirementReturn * 100).toFixed(1)}% — lasts
          through age <strong>{outlook.badDecadeFundedThroughAge}</strong>
          {outlook.badDecadeEndingBalance > 0
            ? ` with ${formatMoney(outlook.badDecadeEndingBalance)} left`
            : ""}
          {outlook.badDecadeGapYears > 0
            ? ` — ${outlook.badDecadeGapYears} year${outlook.badDecadeGapYears === 1 ? "" : "s"} sooner than the usual-return path.`
            : "."}{" "}
          A straight-line return is the optimistic path.
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
                {result.input.twoPerson ? <th className="py-2 pr-3 font-medium">Partner</th> : null}
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
                  {result.input.twoPerson ? (
                    <td className="py-2 pr-3">
                      {row.partnerAge ?? "—"}
                      {!row.primaryAlive || !row.partnerAlive
                        ? !row.primaryAlive && !row.partnerAlive
                          ? ""
                          : row.primaryAlive
                            ? " (you)"
                            : " (partner)"
                        : ""}
                    </td>
                  ) : null}
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

      <CapitalMonthsCard outlook={outlook} />
      <CompileDownloadButton result={result} />
    </section>
  );
}

function HouseholdSurvivorCard({ result }: { result: ProjectionResult }) {
  const { outlook, input } = result;
  if (!input.twoPerson) return null;
  const firstDeath = outlook.firstDeathPrimaryAge;
  const afterDeath = firstDeath != null ? result.years.find((y) => y.age === firstDeath + 1) : null;
  return (
    <section className="card">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Household — entered plan</p>
      <h3 className="mt-2 font-serif text-2xl text-pine">Two persons and the survivor</h3>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
        One nest egg and one set of market returns. While both are alive, both Social Security and pension checks
        count. After the first death, Social Security becomes the larger of the two checks; a pension continues only by
        the survivor share on the form. Lifestyle then uses the survivor factor (
        {(input.survivorLifestyleFactor * 100).toFixed(0)}%). If only one person is in nursing, household lifestyle is
        not cut.
      </p>
      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Plan through (you / partner)</dt>
          <dd className="mt-1 font-serif text-2xl text-ink">
            {input.planToAge} / {input.partnerPlanToAge}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">First death</dt>
          <dd className="mt-1 font-serif text-2xl text-ink">
            {firstDeath == null
              ? "Same year"
              : afterDeath && afterDeath.primaryAlive && !afterDeath.partnerAlive
                ? `Partner, your age ${firstDeath}`
                : `You, age ${firstDeath}`}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Funded through</dt>
          <dd className="mt-1 font-serif text-2xl text-ink">
            {outlook.fundedThroughAge}
            {outlook.partnerFundedThroughAge != null ? ` / ${outlook.partnerFundedThroughAge}` : ""}
          </dd>
          <p className="mt-1 text-xs text-muted">Your age / partner age in that year.</p>
        </div>
      </dl>
    </section>
  );
}

function ClaimingCompareCard({ result }: { result: ProjectionResult }) {
  const { outlook, input } = result;
  const enteredAnnual = input.socialSecurityAnnual;
  return (
    <section className="card">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Social Security — entered plan</p>
      <h3 className="mt-2 font-serif text-2xl text-pine">Claim at 67 vs 70</h3>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
        Your outlook still uses the check and start age on the form ({formatMoney(enteredAnnual)} starting at{" "}
        {input.socialSecurityStartAge}
        {input.twoPerson ? "; this compare is the first person’s check" : ""}). This compare scales that check the way
        delayed retirement credits work in the U.S. — full retirement age 67, and age 70 is 24% higher — then runs the
        same spending path with fewer years of checks.
      </p>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-pine/10 bg-paper-2/40 p-4">
          <dt className="text-xs uppercase tracking-wide text-muted">Claim at 67</dt>
          <dd className="mt-1 font-serif text-2xl text-ink">{formatMoney(outlook.claiming67Annual)} / year</dd>
          <p className="mt-1 text-sm text-ink/85">
            Funded through age <strong>{outlook.claiming67FundedThroughAge}</strong>
          </p>
          <p className="mt-1 text-xs text-muted">Today’s dollars, then COLA from that start age.</p>
        </div>
        <div className="rounded-xl border border-pine/10 bg-paper-2/40 p-4">
          <dt className="text-xs uppercase tracking-wide text-muted">Claim at 70</dt>
          <dd className="mt-1 font-serif text-2xl text-ink">{formatMoney(outlook.claiming70Annual)} / year</dd>
          <p className="mt-1 text-sm text-ink/85">
            Funded through age <strong>{outlook.claiming70FundedThroughAge}</strong>
          </p>
          <p className="mt-1 text-xs text-muted">Higher benefit, three fewer years of checks.</p>
        </div>
      </dl>
    </section>
  );
}

function CapitalMonthsCard({ outlook }: { outlook: ProjectionResult["outlook"] }) {
  return (
    <section className="card">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Capital months — entered plan</p>
      <h3 className="mt-2 font-serif text-2xl text-pine">How long the capital lasts</h3>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
        Months of retirement your plan needs, versus months the accumulated capital actually covers. This uses the
        amounts on the form, not the comfortable-living suggestion.
      </p>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Months of capital required</dt>
          <dd className="mt-1 font-serif text-2xl text-ink">{formatMonths(outlook.requiredMonths)}</dd>
          <p className="mt-1 text-xs text-muted">From full-time work ending through your plan-through age.</p>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Months of capital accumulated</dt>
          <dd className="mt-1 font-serif text-2xl text-ink">{formatMonths(outlook.accumulatedMonths)}</dd>
          <p className="mt-1 text-xs text-muted">
            {outlook.surpassesRequiredMonths
              ? `Until leftover savings would run out. This surpasses the required ${formatMonths(outlook.requiredMonths)}.`
              : outlook.depleted
                ? "Until savings run out."
                : "Until the end of the plan."}
          </p>
        </div>
      </dl>
      <p className="mt-5 text-sm leading-relaxed text-ink/85">
        {outlook.surpassesRequiredMonths
          ? `Savings remaining at the plan-through age: ${formatMoney(outlook.remainingSavings)}.`
          : outlook.remainingExpenseNeed > 0
            ? `Savings still required for remaining expenses after capital runs out: ${formatMoney(outlook.remainingExpenseNeed)}.`
            : `Savings remaining: ${formatMoney(outlook.remainingSavings)}.`}
      </p>
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
  thisRun,
  adoptedBudget,
  onAdopt,
  adopting,
}: {
  comfort: ComfortEstimate;
  currentSavings: number;
  thisRun: PlanSnapshot;
  adoptedBudget: AdoptedComfortBudget | null;
  onAdopt?: () => void;
  adopting: boolean;
}) {
  const adopted = Boolean(adoptedBudget);
  const spendDelta = comfort.spendIfAdopted.fundedThroughAge - thisRun.fundedThroughAge;
  const saveLine =
    comfort.additionalNestEgg <= 0
      ? "On this suggested budget, your current nest egg is already enough in this model. The breakdown below still uses the amounts you entered."
      : comfort.yearsToRetirement > 0
        ? `That is ${formatMoney(comfort.additionalNestEgg)} more than the ${formatMoney(currentSavings)} you entered. Saving about ${formatMoney(comfort.additionalAnnualSavings)} extra per year until retirement is one way this alternative may last through your plan age.`
        : `That is ${formatMoney(comfort.additionalNestEgg)} more than the ${formatMoney(currentSavings)} you entered. Because retirement is already here, this alternative is a nest-egg gap rather than extra yearly saving.`;

  return (
    <section className="card border-gold/40 bg-gold/10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
        {adopted ? "Now your entered plan" : "Suggested alternative — not your entered plan"}
      </p>
      <h3 className="mt-2 font-serif text-2xl text-pine">Comfortable living</h3>
      {adopted && adoptedBudget ? (
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/80">
          You chose this budget. Lifestyle {formatMoney(adoptedBudget.lifestyle)} and healthcare{" "}
          {formatMoney(adoptedBudget.healthcare)} are now on the form. The entered-plan cards, chart, capital months,
          what-if, and PDF below use it. Comfort will not raise that budget again unless you change those two cells.
        </p>
      ) : (
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/80">
          Optional. This is a higher national-style budget you can aim for — not the outlook from the form. Compare it
          to this run first. If you adopt it, only lifestyle and healthcare on the form change, then the outlook
          re-runs. It uses the higher of your lifestyle spending and a $65,000 floor, adds a 10% buffer, and keeps
          healthcare no lower than a typical premium-plus-care amount. Later-life housing is included only if you
          entered it.
        </p>
      )}
      {!adopted ? (
        <>
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
                Savings needed today to last through your plan age.
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

          <div className="mt-6 border-t border-gold/30 pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Compare, then adopt</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Same nest egg and later income as this run. Only lifestyle and healthcare move to{" "}
              {formatMoney(comfort.suggestedLifestyleToday)} and {formatMoney(comfort.suggestedHealthcareToday)}.
            </p>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <PlanSnapshotCard
                label="This run"
                snapshot={thisRun}
                note="The amounts still on the form."
              />
              <PlanSnapshotCard
                label="This comfortable budget"
                snapshot={comfort.spendIfAdopted}
                note="Current savings, suggested spend."
              />
            </dl>
            <p className="mt-4 text-sm font-medium text-pine">{fundedThroughDeltaCopy(spendDelta)}</p>
            {onAdopt ? (
              <button
                type="button"
                onClick={onAdopt}
                disabled={adopting}
                className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-full border px-5 text-sm font-normal disabled:opacity-60 sm:w-auto"
                style={{ backgroundColor: "#f3eee4", color: "#5a6b62", borderColor: "#c8cfc9" }}
              >
                {adopting ? "Updating entered plan…" : "Make this my entered plan"}
              </button>
            ) : null}
            <p className="mt-2 text-xs text-muted">
              Copies those two spending amounts onto the form and re-runs. You can edit the cells again anytime.
            </p>
          </div>
        </>
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

function BreakdownCard({
  title,
  total,
  note,
  rows,
}: {
  title: string;
  total: number;
  note: string;
  rows: { label: string; value: number }[];
}) {
  return (
    <article className="card p-5">
      <p className="text-xs uppercase tracking-wide text-muted">{title}</p>
      <p className="mt-1 font-serif text-2xl text-pine">{formatMoney(total)}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted">{note}</p>
      <dl className="mt-4 space-y-2 border-t border-pine/10 pt-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-3 text-sm">
            <dt className="text-muted">{row.label}</dt>
            <dd className="font-medium text-ink">{formatMoney(row.value)}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

