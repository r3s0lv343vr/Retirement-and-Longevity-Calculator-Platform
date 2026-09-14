"use client";

import { formatMoney, formatYearsMonths } from "@/lib/format";
import { formatYearMonth } from "@/lib/mortgage/payoff";
import type { PayoffStudio, SimulationResult } from "@/lib/mortgage/payoff";
import { useState } from "react";

type Props = {
  studio: PayoffStudio;
  selectedId: string;
  onSelect: (id: string) => void;
  onUseFreedomExtra: (amount: number) => void;
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 font-serif text-2xl text-ink">{value}</dd>
    </div>
  );
}

export function PayoffResults({ studio, selectedId, onSelect, onUseFreedomExtra }: Props) {
  const { baseline, selected, quick, mortgage, freedom } = studio;
  const headline = selected.neverPaysOff
    ? "This path never retires the balance at the payment you entered"
    : selected.periods < baseline.periods
      ? `You could be mortgage-free ${formatYearsMonths(baseline.periods - selected.periods)} sooner.`
      : "The current path matches the original payoff date.";
  const [monthlyTable, setMonthlyTable] = useState(false);

  return (
    <section id="payoff-result" className="space-y-5">
      <div className="card border-gold/40 bg-gold/10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Time reclaimed</p>
        <h2 className="mt-2 font-serif text-2xl leading-tight text-pine">{headline}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/80">
          {selected.payoffDate
            ? `New payoff ${formatYearMonth(selected.payoffDate)} versus ${baseline.payoffDate ? formatYearMonth(baseline.payoffDate) : "an open-ended loan"}.`
            : "The scheduled payment does not cover interest, so extras have to do the work."}{" "}
          Interest avoided {formatMoney(baseline.interestPaid - selected.interestPaid)}.
        </p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <Metric
            label="Original payoff"
            value={baseline.payoffDate ? formatYearMonth(baseline.payoffDate) : "Does not finish"}
          />
          <Metric
            label="This path"
            value={selected.payoffDate ? formatYearMonth(selected.payoffDate) : "Does not finish"}
          />
          <Metric label="Interest avoided" value={formatMoney(Math.max(0, baseline.interestPaid - selected.interestPaid))} />
        </dl>
        <p className="mt-4 text-sm text-muted">
          Showing {selected.name}. Scheduled P&I {formatMoney(mortgage.scheduledPayment)}
          {quick.extraPaid > 0 ? ` · quick extra paid ${formatMoney(quick.extraPaid)}` : ""}
          {selected.extraPaid > 0 && selected.id !== "quick" ? ` · this path extra ${formatMoney(selected.extraPaid)}` : ""}
          .
        </p>
      </div>

      <div className="card">
        <h3 className="font-serif text-xl text-pine">Baseline versus accelerated balance</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          The pine line is the selected path. Gold is the loan with no extras.
        </p>
        <BalanceCompareChart baseline={baseline} accelerated={selected} />
      </div>

      <div className="card">
        <h3 className="font-serif text-xl text-pine">Freedom date</h3>
        {freedom.possible ? (
          <>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">
              {freedom.alreadyThere
                ? `You are already mortgage-free by ${formatYearMonth(freedom.target)} on the scheduled payment.`
                : `To be mortgage-free in ${formatYearMonth(freedom.target)}, this loan needs about ${formatMoney(freedom.extraMonthly)} extra each month — a total P&I of ${formatMoney(freedom.totalPayment)}.`}
            </p>
            {!freedom.alreadyThere ? (
              <button
                type="button"
                onClick={() => onUseFreedomExtra(freedom.extraMonthly)}
                className="mt-4 inline-flex h-11 items-center rounded-full bg-pine px-4 text-sm font-semibold text-paper"
              >
                Use {formatMoney(freedom.extraMonthly)} / month as the quick extra
              </button>
            ) : null}
          </>
        ) : (
          <p className="mt-2 text-sm text-short">{freedom.reason}</p>
        )}
      </div>

      <div className="card">
        <h3 className="font-serif text-xl text-pine">Feasible extras and the dates they buy</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Lower extras still move the date. The required freedom extra is marked when the solver found one.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted">
                <th className="pb-2 font-medium">Extra / month</th>
                <th className="pb-2 font-medium">Payoff</th>
                <th className="pb-2 font-medium">Time reclaimed</th>
                <th className="pb-2 font-medium">Interest avoided</th>
              </tr>
            </thead>
            <tbody>
              {studio.feasible.map((row) => (
                <tr
                  key={row.extraMonthly}
                  className={`border-t border-pine/10 ${row.isRequired ? "font-semibold text-pine" : ""}`}
                >
                  <td className="py-2">
                    {formatMoney(row.extraMonthly)}
                    {row.isRequired ? " · required" : ""}
                  </td>
                  <td>{row.payoffDate ? formatYearMonth(row.payoffDate) : "—"}</td>
                  <td>{formatYearsMonths(row.periodsSaved)}</td>
                  <td>{formatMoney(row.interestAvoided)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 className="font-serif text-xl text-pine">Strategy comparison</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Earliest payoff, lowest projected interest, and lowest recurring extra are marked. Flags mean a stated
          lender rule may not allow that extra.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {studio.comparison.map((row) => (
            <article
              key={row.id}
              className={`rounded-xl border px-4 py-4 ${
                selectedId === row.id ? "border-pine/40 bg-white" : "border-pine/10 bg-paper/60"
              }`}
            >
              <button type="button" onClick={() => onSelect(row.id)} className="w-full text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">{row.name}</p>
                {selectedId === row.id ? (
                  <p className="mt-1 text-xs text-muted">Shown in the headline and chart</p>
                ) : (
                  <p className="mt-1 text-xs text-pine">Show this path</p>
                )}
              </button>
              <p className="mt-2 font-serif text-2xl text-ink">
                {row.payoffDate ? formatYearMonth(row.payoffDate) : "Does not finish"}
              </p>
              <p className="mt-1 text-sm text-muted">
                {formatYearsMonths(row.periodsSaved)} sooner · interest avoided {formatMoney(row.interestAvoided)}
              </p>
              <p className="mt-2 text-sm text-ink">
                Recurring extra {formatMoney(row.recurringMonthly)} / month · extra paid {formatMoney(row.extraPaid)}
              </p>
              <p className="mt-2 text-xs text-muted">
                {studio.rankings.earliestId === row.id ? "Earliest payoff. " : ""}
                {studio.rankings.lowestInterestId === row.id ? "Lowest projected interest. " : ""}
                {studio.rankings.lowestRecurringId === row.id ? "Lowest recurring extra. " : ""}
              </p>
              {row.ruleFlags.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-watch">
                  {row.ruleFlags.map((flag) => (
                    <li key={flag}>{flag}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="font-serif text-xl text-pine">Timing laboratory</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          The same annual cash, applied monthly, quarterly, in January, or in December. Early extra usually saves more
          interest — unless the loan starts late in the year.
        </p>
        <ul className="mt-4 space-y-3">
          {studio.timing.map((row) => (
            <li key={row.id} className="rounded-xl border border-pine/10 px-4 py-3">
              <p className="font-medium text-ink">{row.name}</p>
              <p className="text-sm text-muted">{row.note}</p>
              <p className="mt-1 text-sm">
                Payoff {row.result.payoffDate ? formatYearMonth(row.result.payoffDate) : "—"} ·{" "}
                {formatYearsMonths(row.periodsSaved)} sooner · interest avoided {formatMoney(row.interestAvoided)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3 className="font-serif text-xl text-pine">Temporary acceleration</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          The same extra for 2, 5, or 10 years, then back to the scheduled payment. This is not a forever habit.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {studio.temporary.map((row) => (
            <div key={row.years} className="rounded-xl border border-pine/10 bg-paper/60 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">{row.years} years</p>
              <p className="mt-2 font-serif text-2xl text-ink">{formatYearsMonths(row.periodsSaved)}</p>
              <p className="mt-1 text-sm text-muted">sooner · {formatMoney(row.interestAvoided)} interest avoided</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="font-serif text-xl text-pine">Milestones</h3>
        <ul className="mt-4 space-y-2 text-sm">
          {selected.milestones.map((row) => (
            <li key={row.id} className="flex flex-wrap justify-between gap-2 border-t border-pine/10 py-2 first:border-t-0">
              <span>{row.label}</span>
              <span className="text-muted">
                {formatYearMonth(row.date)} · {formatMoney(row.balance)} left
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 className="font-serif text-xl text-pine">Amortization</h3>
          <button
            type="button"
            onClick={() => setMonthlyTable((value) => !value)}
            className="text-sm font-medium text-pine underline decoration-pine/30 underline-offset-2"
          >
            {monthlyTable ? "Show years" : "Show months"}
          </button>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Selected path. Extra is principal only. The scheduled payment is not recast after a lump sum.
        </p>
        <div className="mt-4 overflow-x-auto">
          {monthlyTable ? (
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted">
                  <th className="pb-2 font-medium">Month</th>
                  <th className="pb-2 font-medium">Interest</th>
                  <th className="pb-2 font-medium">Scheduled</th>
                  <th className="pb-2 font-medium">Extra</th>
                  <th className="pb-2 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {selected.months.map((row) => (
                  <tr key={row.period} className="border-t border-pine/10">
                    <td className="py-1.5">{formatYearMonth(row.date)}</td>
                    <td>{formatMoney(row.interest)}</td>
                    <td>{formatMoney(row.scheduledPrincipal)}</td>
                    <td>{formatMoney(row.extra)}</td>
                    <td>{formatMoney(row.endingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted">
                  <th className="pb-2 font-medium">Year</th>
                  <th className="pb-2 font-medium">Interest</th>
                  <th className="pb-2 font-medium">Extra</th>
                  <th className="pb-2 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {selected.years.map((row) => (
                  <tr key={row.calendarYear} className="border-t border-pine/10">
                    <td className="py-1.5">{row.calendarYear}</td>
                    <td>{formatMoney(row.interest)}</td>
                    <td>{formatMoney(row.extra)}</td>
                    <td>{formatMoney(row.endingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <button
          type="button"
          onClick={() => downloadPayoffCsv(selected)}
          className="mt-4 text-sm font-medium text-pine underline decoration-pine/30 underline-offset-2"
        >
          Download this schedule as CSV
        </button>
      </div>

      <div className="card">
        <h3 className="font-serif text-xl text-pine">Assumptions and lender limits</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
          <li>Fixed-rate, monthly amortization. Extra amounts are applied to principal in the month they fall.</li>
          <li>A lump sum does not recast the scheduled payment. Faster payoff, same note payment, unless you ask the servicer.</li>
          <li>
            Biweekly and weekly extras are actual paydays from the first of the start month, not a “biweekly mortgage”
            toggle that quietly adds a thirteenth payment.
          </li>
          <li>Lender and servicer rules differ. Caps you type only flag a strategy; they do not block the simulation.</li>
          <li>Results are estimates from the numbers you entered. They are not a payoff quote or advice.</li>
        </ul>
      </div>
    </section>
  );
}

function BalanceCompareChart({
  baseline,
  accelerated,
}: {
  baseline: SimulationResult;
  accelerated: SimulationResult;
}) {
  const width = 640;
  const height = 160;
  const pad = { left: 8, right: 8, top: 12, bottom: 20 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxPeriods = Math.max(baseline.years.length, accelerated.years.length, 1);
  const startBalance = Math.max(baseline.months[0] ? baseline.months[0].endingBalance + baseline.months[0].principal : 1, 1);
  const pathFor = (result: SimulationResult) =>
    result.years
      .map((row, i) => {
        const x = pad.left + (i / Math.max(maxPeriods - 1, 1)) * innerW;
        const y = pad.top + (1 - row.endingBalance / startBalance) * innerH;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-4 h-auto w-full"
      role="img"
      aria-label="Baseline versus accelerated remaining balance"
    >
      <path d={pathFor(baseline)} fill="none" stroke="#c4a35a" strokeWidth="2.25" />
      <path d={pathFor(accelerated)} fill="none" stroke="#1d4a38" strokeWidth="2.25" />
      <text x={pad.left} y={height - 4} fontSize="11" fill="#5a6b62">
        Start
      </text>
      <text x={width - pad.right} y={height - 4} fontSize="11" fill="#5a6b62" textAnchor="end">
        Paid off
      </text>
    </svg>
  );
}

function downloadPayoffCsv(result: SimulationResult) {
  const header = "period,month,interest,scheduled_principal,extra,payment,ending_balance";
  const lines = result.months.map((row) =>
    [
      row.period,
      `${row.date.year}-${String(row.date.month).padStart(2, "0")}`,
      row.interest,
      row.scheduledPrincipal,
      row.extra,
      row.payment,
      row.endingBalance,
    ].join(","),
  );
  const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "runaway-mortgage-payoff.csv";
  link.click();
  URL.revokeObjectURL(url);
}
