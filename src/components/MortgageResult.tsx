"use client";

import { useState } from "react";
import { formatMoney, formatMonths, formatPercent } from "@/lib/format";
import { downloadMortgageCsv } from "@/lib/mortgage/exportSchedule";
import { firstHousingBreakdown, moneyGoesRows } from "@/lib/mortgage/exportSchedule";
import type { MortgageEstimate, MortgagePath, MortgageStatus } from "@/lib/mortgage/estimateMortgage";

const HEADLINE: Record<MortgageStatus, string> = {
  comfortable: "The house payment still leaves a buffer through year 10",
  buffered: "The year is short, but the investment pile covers the gap",
  tight: "Year one clears, then inflation or a later year gets tight",
  short: "Year one does not clear after tax, insurance, and life costs",
  depleted: "The pile is emptied while the house and life still overflow",
};

const EXTRA_PRESETS = [100, 250, 500];

type Props = {
  result: MortgageEstimate;
  onExtraMonthly: (amount: number) => void;
};

export function MortgageResult({ result, onExtraMonthly }: Props) {
  const { primary, compare } = result;
  const breakdown = firstHousingBreakdown(result);
  const goes = moneyGoesRows(result);
  const goesMax = Math.max(...goes.map((row) => row.amount), 1);
  const [monthlyTable, setMonthlyTable] = useState(false);

  return (
    <section id="mortgage-result" className="space-y-5">
      <div className="card border-gold/40 bg-gold/10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Your mortgage</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Monthly payment — principal + interest</p>
            <p className="mt-1 font-serif text-3xl text-pine">{formatMoney(primary.monthlyPI)}</p>
            <p className="mt-1 text-sm text-muted">This is the loan payment, not the cost of the house.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Estimated housing cost</p>
            <p className="mt-1 font-serif text-3xl text-ink">{formatMoney(primary.firstHousingMonthly)}</p>
            <p className="mt-1 text-sm text-muted">P&I plus tax, insurance, PMI, HOA, and upkeep in year one.</p>
          </div>
        </div>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <Breakdown label="P&I" amount={breakdown.pi} />
          <Breakdown label="Tax" amount={breakdown.tax} />
          <Breakdown label="Insurance" amount={breakdown.insurance} />
          <Breakdown label="PMI" amount={breakdown.pmi} />
          <Breakdown label="HOA" amount={breakdown.hoa} />
          <Breakdown label="Upkeep" amount={breakdown.maintenance} />
        </dl>
      </div>

      <div className="card">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">The buffer</p>
        <h2 className="mt-2 font-serif text-2xl text-pine">{HEADLINE[result.status]}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/80">
          Year-one housing is {formatPercent(primary.housingRatio, 0)} of take-home. Adding car and other loans
          makes {formatPercent(primary.obligationRatio, 0)}. These are household shares, not a lender approval.
        </p>
      </div>

      <div className="card">
        <h3 className="font-serif text-xl text-pine">The house costs {formatMoney(result.input.homePrice)}</h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/80">
          You may spend {formatMoney(primary.totalHousingOutflow + result.cashToBuy)} owning it on this path —
          purchase cash, then mortgage and housing costs over the loan. Projected ownership expenses are not part
          of the loan.
        </p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-4">
          <Metric label="Purchase price" value={formatMoney(result.input.homePrice)} />
          <Metric label="Mortgage borrowed" value={formatMoney(primary.loanAmount)} />
          <Metric label="Total interest" value={formatMoney(primary.totalInterest)} />
          <Metric label="Housing cash outflow" value={formatMoney(primary.totalHousingOutflow)} />
        </dl>
      </div>

      <div className="card">
        <h3 className="font-serif text-xl text-pine">Where the money goes</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Financing is principal and interest. Ownership is tax, insurance, HOA, upkeep, PMI, and cash to buy.
        </p>
        <ul className="mt-4 space-y-2">
          {goes.map((row) => (
            <li key={row.label}>
              <div className="flex justify-between text-sm">
                <span>{row.label}</span>
                <span>{formatMoney(row.amount)}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-pine/10">
                <div
                  className="h-2 rounded-full bg-pine"
                  style={{ width: `${Math.max(4, (row.amount / goesMax) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">
          Financing {formatMoney(primary.totalFinancing)} · ownership costs {formatMoney(primary.totalOwnership)}{" "}
          · cash to buy {formatMoney(result.cashToBuy)}.
        </p>
      </div>

      <div className="card">
        <h3 className="font-serif text-xl text-pine">Principal versus interest</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          First payment is {formatMoney(primary.firstPaymentInterest)} interest and{" "}
          {formatMoney(primary.firstPaymentPrincipal)} principal.
          {primary.crossoverYear
            ? ` More of each year’s scheduled pay goes to principal starting in year ${primary.crossoverYear}.`
            : " Principal never overtakes interest on this path."}
        </p>
        <PrincipalInterestChart path={primary} />
      </div>

      <div className="card">
        <h3 className="font-serif text-xl text-pine">Mortgage balance</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Remaining balance after year 5 is {formatMoney(primary.firstFive.remaining)}. Paid off in{" "}
          {formatMonths(primary.monthsToPayoff)}.
        </p>
        <BalanceChart path={primary} />
      </div>

      <div className="card">
        <h3 className="font-serif text-xl text-pine">What if you pay more?</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Extra to principal. Time gained is as important as dollars saved.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {EXTRA_PRESETS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => onExtraMonthly(amount)}
              className={`inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold ${
                result.input.extraMonthly === amount
                  ? "bg-pine text-paper"
                  : "border border-pine/20 bg-paper text-pine hover:bg-pine/5"
              }`}
            >
              +{formatMoney(amount)} / month
            </button>
          ))}
        </div>
        {result.monthsGained > 0 ? (
          <p className="mt-4 font-serif text-xl text-pine">
            Mortgage-free {formatMonths(result.monthsGained)} sooner. Interest saved{" "}
            {formatMoney(result.interestSaved)}.
          </p>
        ) : (
          <p className="mt-4 text-sm text-muted">Pick an extra, or enter one under Extra payments, then run again.</p>
        )}
      </div>

      <div className="card">
        <h3 className="font-serif text-xl text-pine">Rate sensitivity</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">The same loan at nearby rates. Scheduled interest only.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[24rem] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted">
                <th className="pb-2 font-medium">Rate</th>
                <th className="pb-2 font-medium">P&I</th>
                <th className="pb-2 font-medium">Total interest</th>
              </tr>
            </thead>
            <tbody>
              {result.rateSensitivity.map((row) => (
                <tr
                  key={row.rate}
                  className={`border-t border-pine/10 ${row.rate === result.input.annualRate ? "font-semibold text-pine" : ""}`}
                >
                  <td className="py-2">{formatPercent(row.rate, 2)}</td>
                  <td>{formatMoney(row.monthlyPI)}</td>
                  <td>{formatMoney(row.totalInterest)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 className="font-serif text-xl text-pine">Down-payment comparison</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Same price and rate. PMI uses the monthly amount you entered when the loan stays above 80% LTV.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted">
                <th className="pb-2 font-medium">Down</th>
                <th className="pb-2 font-medium">Cash</th>
                <th className="pb-2 font-medium">Loan</th>
                <th className="pb-2 font-medium">P&I</th>
                <th className="pb-2 font-medium">Housing</th>
                <th className="pb-2 font-medium">Interest</th>
              </tr>
            </thead>
            <tbody>
              {result.downPaymentScenarios.map((row) => (
                <tr
                  key={row.percent}
                  className={`border-t border-pine/10 ${Math.abs(row.percent - result.input.downPayment / result.input.homePrice) < 0.005 ? "font-semibold text-pine" : ""}`}
                >
                  <td className="py-2">{formatPercent(row.percent, 0)}</td>
                  <td>{formatMoney(row.cash)}</td>
                  <td>{formatMoney(row.loan)}</td>
                  <td>{formatMoney(row.monthlyPI)}</td>
                  <td>{formatMoney(row.housingMonthly)}</td>
                  <td>{formatMoney(row.totalInterest)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 className="font-serif text-xl text-pine">Cash needed to buy</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">Editable assumptions, not a closing disclosure.</p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <Metric label="Down payment" value={formatMoney(result.input.downPayment)} />
          <Metric label="Closing costs" value={formatMoney(result.input.closingCost)} />
          <Metric label="Moving" value={formatMoney(result.input.movingCost)} />
          <Metric label="Repairs / furnishing" value={formatMoney(result.input.furnishingCost)} />
        </dl>
        <p className="mt-4 font-serif text-2xl text-pine">{formatMoney(result.cashToBuy)} upfront</p>
      </div>

      <div className="card">
        <h3 className="font-serif text-xl text-pine">Your first five years</h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <Metric label="Mortgage payments" value={formatMoney(primary.firstFive.payments)} />
          <Metric label="Principal repaid" value={formatMoney(primary.firstFive.principal)} />
          <Metric label="Interest paid" value={formatMoney(primary.firstFive.interest)} />
          <Metric label="Housing costs" value={formatMoney(primary.firstFive.housing)} />
          <Metric label="Remaining balance" value={formatMoney(primary.firstFive.remaining)} />
        </dl>
      </div>

      <div className="card">
        <h3 className="font-serif text-xl text-pine">Years 1, 5, and 10</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Insurance, tax, HOA, and living costs grow. PMI drops at 80% LTV.
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
                const row = primary.years.find((item) => item.year === year);
                if (!row) return null;
                return (
                  <tr key={year} className="border-t border-pine/10">
                    <td className="py-2">{year}</td>
                    <td>{formatMoney(row.housing)}</td>
                    <td>{formatMoney(row.insurance)}</td>
                    <td className={row.leftover < 0 ? "text-short" : ""}>{formatMoney(row.leftover)}</td>
                    <td>{formatMoney(row.endingPile)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {compare ? (
        <div className="card">
          <h3 className="font-serif text-xl text-pine">Compare another loan</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">Same income, life costs, and pile. Only the loan changes.</p>
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
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl text-pine">Amortization</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">Yearly rollup, or every month. CSV is the full schedule.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMonthlyTable(false)}
              className={`inline-flex h-10 items-center rounded-full px-4 text-sm ${monthlyTable ? "border border-pine/20 text-pine" : "bg-pine text-paper"}`}
            >
              Yearly
            </button>
            <button
              type="button"
              onClick={() => setMonthlyTable(true)}
              className={`inline-flex h-10 items-center rounded-full px-4 text-sm ${monthlyTable ? "bg-pine text-paper" : "border border-pine/20 text-pine"}`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => downloadMortgageCsv(result)}
              className="inline-flex h-10 items-center rounded-full border border-pine/20 px-4 text-sm text-pine"
            >
              Export CSV
            </button>
          </div>
        </div>
        <div className="mt-4 max-h-[28rem] overflow-auto">
          {monthlyTable ? (
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted">
                  <th className="pb-2 font-medium">Month</th>
                  <th className="pb-2 font-medium">Principal</th>
                  <th className="pb-2 font-medium">Interest</th>
                  <th className="pb-2 font-medium">Extra</th>
                  <th className="pb-2 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {primary.months.map((row) => (
                  <tr key={row.month} className="border-t border-pine/10">
                    <td className="py-1.5">{row.month}</td>
                    <td>{formatMoney(row.principal)}</td>
                    <td>{formatMoney(row.interest)}</td>
                    <td>{formatMoney(row.extra)}</td>
                    <td>{formatMoney(row.endingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
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
          )}
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

function Breakdown({ label, amount }: { label: string; amount: number }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5">{formatMoney(amount)}</dd>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 font-serif text-2xl text-ink">{value}</dd>
    </div>
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
        Year-one housing {formatMoney(path.firstHousingMonthly)} / month.
      </p>
    </div>
  );
}

function PrincipalInterestChart({ path }: { path: MortgagePath }) {
  const width = 640;
  const height = 160;
  const pad = { left: 8, right: 8, top: 8, bottom: 20 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(...path.years.map((row) => row.principal + row.interest), 1);
  const gap = 2;
  const barW = Math.max(2, innerW / path.years.length - gap);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-auto w-full" role="img" aria-label="Principal versus interest by year">
      {path.years.map((row, i) => {
        const x = pad.left + i * (barW + gap);
        const interestH = (row.interest / max) * innerH;
        const principalH = (row.principal / max) * innerH;
        return (
          <g key={row.year}>
            <rect x={x} y={pad.top + innerH - interestH - principalH} width={barW} height={principalH} fill="#1d4a38" />
            <rect x={x} y={pad.top + innerH - interestH} width={barW} height={interestH} fill="#c4a35a" />
          </g>
        );
      })}
      <text x={pad.left} y={height - 4} fontSize="11" fill="#5a6b62">
        Year 1
      </text>
      <text x={width - pad.right} y={height - 4} fontSize="11" fill="#5a6b62" textAnchor="end">
        Year {path.years.at(-1)?.year}
      </text>
    </svg>
  );
}

function BalanceChart({ path }: { path: MortgagePath }) {
  const width = 640;
  const height = 140;
  const pad = { left: 8, right: 8, top: 12, bottom: 20 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(path.loanAmount, 1);
  const points = path.years.map((row, i) => {
    const x = pad.left + (i / Math.max(path.years.length - 1, 1)) * innerW;
    const y = pad.top + (1 - row.endingBalance / max) * innerH;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  const last = path.years.at(-1);
  const firstX = pad.left;
  const lastX = pad.left + innerW;
  const base = pad.top + innerH;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-auto w-full" role="img" aria-label="Remaining mortgage balance by year">
      <path
        d={`${points.join(" ")} L ${lastX} ${base} L ${firstX} ${base} Z`}
        fill="#1d4a38"
        opacity="0.12"
      />
      <path d={points.join(" ")} fill="none" stroke="#1d4a38" strokeWidth="2.25" />
      <text x={pad.left} y={height - 4} fontSize="11" fill="#5a6b62">
        Start {formatMoney(path.loanAmount)}
      </text>
      <text x={width - pad.right} y={height - 4} fontSize="11" fill="#5a6b62" textAnchor="end">
        End {formatMoney(last?.endingBalance ?? 0)}
      </text>
    </svg>
  );
}
