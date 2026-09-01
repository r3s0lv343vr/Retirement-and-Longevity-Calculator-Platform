"use client";

import { useEffect, useRef, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import { ChildCompileDownloadButton } from "@/components/ChildCompileDownloadButton";
import { ChildForm } from "@/components/ChildForm";
import { CHILD_DEFAULT } from "@/lib/child/defaults";
import {
  CHILD_PHASE_LABEL,
  type ChildEstimate,
  type ChildPot,
  type ChildSaveSchedule,
  type ChildSaveTarget,
  type ChildYearRow,
} from "@/lib/child/estimateChild";
import type { ChildInput } from "@/lib/child/defaults";
import { buildChildNarrative, childMilestones, potNote, readinessHeadline, saveTargetCopy } from "@/lib/child/narrative";
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

function ChildResult({ result }: { result: ChildEstimate }) {
  const { readiness } = result;
  const steps = buildChildNarrative(result);
  const marks = childMilestones(result);
  return (
    <section id="child-result" className="space-y-5">
      <div className="card border-gold/40 bg-gold/10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          Present value through 18 — then university
        </p>
        <h2 className="mt-2 font-serif text-2xl text-pine">{readinessHeadline(readiness)}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/80">
          Year-one living is monthly cost × 12. That stream grows with inflation and age-related demand through 18, and
          the raising pot is the present value that, invested at your return, pays each year’s expenses. School and
          co-curricular sit on the same pot. University stays separate.
        </p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Present value through 18</dt>
            <dd className="mt-1 font-serif text-2xl text-ink">{formatMoney(readiness.presentValueThrough18)}</dd>
            <p className="mt-1 text-xs text-muted">
              Living {formatMoney(readiness.livingPresentValue)} · school {formatMoney(readiness.schoolPresentValue)}.
            </p>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Years until ready</dt>
            <dd className="mt-1 font-serif text-2xl text-ink">
              {readiness.childAlreadyHere
                ? "—"
                : readiness.yearsUntilReady === null
                  ? "Not at this rate"
                  : String(readiness.yearsUntilReady)}
            </dd>
            <p className="mt-1 text-xs text-muted">
              {readiness.childAlreadyHere
                ? "The child is already here. Use extra yearly saving on the raising pot."
                : readiness.yearsUntilReady === null
                  ? "Saving $0, or too little, never reaches this present value in 40 years."
                  : `You planned ${readiness.plannedYearsUntilBaby} year${readiness.plannedYearsUntilBaby === 1 ? "" : "s"} until the baby.`}
            </p>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">School funded by the pot?</dt>
            <dd className="mt-1 font-serif text-2xl text-ink">{readiness.coversSchool ? "Yes" : "No"}</dd>
            <p className="mt-1 text-xs text-muted">
              {readiness.salaryDependentSchool
                ? "Preschool and school would depend mainly on salary."
                : readiness.coversLivingToSchool
                  ? "Living costs reach school start in this model."
                  : "The pot runs out before school starts."}
            </p>
          </div>
        </dl>
      </div>
      <div className="card">
        <h3 className="font-serif text-xl text-pine">The two nest eggs</h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/80">
          Combined need today is <strong>{formatMoney(result.combinedNeeded)}</strong>. You have{" "}
          {formatMoney(result.combinedHave)} already split across the two pots.
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
      <SaveScheduleCard raising={result.raisingSave} university={result.universitySave} />
      {result.warnings.length > 0 ? (
        <ul className="card list-disc space-y-1 px-8 text-sm text-muted">
          {result.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}

      <div className="card">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Train of thought</p>
        <h3 className="mt-2 font-serif text-2xl text-pine">How we got here</h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Read these steps in order. Each one uses the amounts on the form, not a national average. The tables below are
          the same arithmetic, year by year.
        </p>
        <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-ink/85">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>

      {marks.length > 0 ? (
        <div className="card">
          <h3 className="font-serif text-xl text-pine">Landmarks on the map</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
            The years that change the plan — baby, school, last raising year, university. Use them to find your place in
            the tables.
          </p>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2">
            {marks.map((mark) => (
              <li key={mark.id} className="rounded-xl border border-pine/10 bg-paper-2/40 p-4">
                <p className="text-xs uppercase tracking-wide text-muted">{mark.label}</p>
                <p className="mt-1 font-serif text-lg text-ink">
                  {mark.yearFromNow === 0
                    ? "This year"
                    : `In ${mark.yearFromNow} year${mark.yearFromNow === 1 ? "" : "s"}`}
                  {mark.childAge === null ? "" : ` · age ${mark.childAge}`}
                </p>
                <p className="mt-1 text-sm text-ink/80">{mark.note}</p>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <YearTables years={result.years} />
      <ChildCompileDownloadButton result={result} />
    </section>
  );
}

function YearTables({ years }: { years: ChildYearRow[] }) {
  if (years.length === 0) {
    return (
      <div className="card">
        <h3 className="font-serif text-xl text-pine">Year-by-year map</h3>
        <p className="mt-2 text-sm text-muted">There are no remaining cost years on this run.</p>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <h3 className="font-serif text-xl text-pine">Costs through the years</h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Every year from now through the last university year. Living grows with inflation and age-related demand.
          School and extras begin at school start. University is a separate column.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-pine/15 text-muted">
                <th className="py-2 pr-3 font-medium">Year</th>
                <th className="py-2 pr-3 font-medium">Age</th>
                <th className="py-2 pr-3 font-medium">Phase</th>
                <th className="py-2 pr-3 font-medium">Living</th>
                <th className="py-2 pr-3 font-medium">School</th>
                <th className="py-2 pr-3 font-medium">Extras</th>
                <th className="py-2 pr-3 font-medium">University</th>
                <th className="py-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {years.map((row, index) => {
                const phaseBreak = index === 0 || years[index - 1].phase !== row.phase;
                return (
                  <tr
                    key={`cost-${row.yearFromNow}`}
                    className={`border-b border-pine/8 ${phaseBreak ? "border-t border-pine/20" : ""}`}
                  >
                    <td className="py-2 pr-3">{row.yearFromNow}</td>
                    <td className="py-2 pr-3">{row.childAge === null ? "—" : row.childAge}</td>
                    <td className="py-2 pr-3">{CHILD_PHASE_LABEL[row.phase]}</td>
                    <td className="py-2 pr-3">{formatMoney(row.living)}</td>
                    <td className="py-2 pr-3">{formatMoney(row.school)}</td>
                    <td className="py-2 pr-3">{formatMoney(row.extra)}</td>
                    <td className="py-2 pr-3">{formatMoney(row.university)}</td>
                    <td className="py-2 font-medium">{formatMoney(row.totalCost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 className="font-serif text-xl text-pine">The two pots through the years</h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Current plan: start the year with what is left, grow it at your return, add the yearly saving, then pay that
          year’s cost. After university starts, the raising column holds whatever was left (or the hole). A negative end
          means this plan does not cover that year — salary or a larger nest egg would have to.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-pine/15 text-muted">
                <th className="py-2 pr-3 font-medium">Year</th>
                <th className="py-2 pr-3 font-medium">Age</th>
                <th className="py-2 pr-3 font-medium">Add raising</th>
                <th className="py-2 pr-3 font-medium">Raising end</th>
                <th className="py-2 pr-3 font-medium">Add university</th>
                <th className="py-2 font-medium">University end</th>
              </tr>
            </thead>
            <tbody>
              {years.map((row) => {
                const raisingShort = row.raisingEnd < -0.5;
                const uniShort = row.universityEnd < -0.5;
                return (
                  <tr key={`pot-${row.yearFromNow}`} className="border-b border-pine/8">
                    <td className="py-2 pr-3">{row.yearFromNow}</td>
                    <td className="py-2 pr-3">{row.childAge === null ? "—" : row.childAge}</td>
                    <td className="py-2 pr-3">{formatMoney(row.raisingContribution)}</td>
                    <td className={`py-2 pr-3 font-medium ${raisingShort ? "text-short" : ""}`}>
                      {formatMoney(row.raisingEnd)}
                    </td>
                    <td className="py-2 pr-3">{formatMoney(row.universityContribution)}</td>
                    <td className={`py-2 font-medium ${uniShort ? "text-short" : ""}`}>
                      {formatMoney(row.universityEnd)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function SaveScheduleCard({
  raising,
  university,
}: {
  raising: ChildSaveSchedule;
  university: ChildSaveSchedule;
}) {
  return (
    <div className="card">
      <h3 className="font-serif text-xl text-pine">Yearly add to stay off salary</h3>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/80">
        Inverse of years until ready. Each figure is the yearly add during that window so the pot never goes negative.
        Shorter windows need a larger add. Extra is on top of the yearly add already on the form.
      </p>
      <dl className="mt-5 grid gap-4 lg:grid-cols-2">
        <SaveColumn title="Through 18" schedule={raising} />
        <SaveColumn title="University" schedule={university} />
      </dl>
    </div>
  );
}

function SaveColumn({ title, schedule }: { title: string; schedule: ChildSaveSchedule }) {
  return (
    <div className="rounded-xl border border-pine/10 bg-paper-2/40 p-4">
      <dt className="text-xs uppercase tracking-wide text-muted">{title}</dt>
      <SaveRow label="By the baby" target={schedule.byBaby} />
      <SaveRow label="By school start" target={schedule.bySchool} />
      <SaveRow label="By university start" target={schedule.byUniversity} />
    </div>
  );
}

function SaveRow({ label, target }: { label: string; target: ChildSaveTarget }) {
  const copy = saveTargetCopy(target);
  const window =
    target.years <= 0 ? "no years left to save" : `${target.years} year${target.years === 1 ? "" : "s"} to save`;
  return (
    <div className="mt-3 border-t border-pine/10 pt-3 first:mt-1 first:border-t-0 first:pt-0">
      <p className="text-xs uppercase tracking-wide text-muted">
        {label} · {window}
      </p>
      <dd className="mt-1 font-serif text-xl text-ink">{copy.value}</dd>
      <p className="mt-1 text-xs text-muted">{copy.note}</p>
    </div>
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
