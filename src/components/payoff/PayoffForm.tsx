"use client";

import { AdSlot } from "@/components/AdSlot";
import { DetailsCard, PayoffField } from "@/components/payoff/fields";
import {
  addMonths,
  emptyEvent,
  formatYearMonth,
  newEventId,
  type PayoffMortgageInput,
  type PaymentEvent,
  type PaymentEventType,
  type Scenario,
} from "@/lib/mortgage/payoff";
import { formatMoney } from "@/lib/format";

const EXTRA_PRESETS = [0, 50, 100, 250, 500];
const EVENT_TYPES: { type: PaymentEventType; label: string }[] = [
  { type: "monthly", label: "Monthly extra" },
  { type: "annual", label: "Annual extra" },
  { type: "lumpSum", label: "One-time lump" },
  { type: "temporary", label: "Temporary extra" },
  { type: "escalating", label: "Escalating extra" },
  { type: "paycheck", label: "Paycheck extra" },
  { type: "pause", label: "Pause extras" },
];

type Props = {
  values: PayoffMortgageInput;
  strategies: Scenario[];
  selectedId: string;
  scheduledPayment: number;
  onChange: (next: PayoffMortgageInput) => void;
  onStrategies: (next: Scenario[]) => void;
  onSelect: (id: string) => void;
};

function setNumber(raw: string, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function PayoffForm({
  values,
  strategies,
  selectedId,
  scheduledPayment,
  onChange,
  onStrategies,
  onSelect,
}: Props) {
  const selected = strategies.find((row) => row.id === selectedId) ?? strategies[0];

  const updateEvent = (eventId: string, patch: Partial<PaymentEvent>) => {
    if (!selected) return;
    onStrategies(
      strategies.map((scenario) =>
        scenario.id !== selected.id
          ? scenario
          : {
              ...scenario,
              events: scenario.events.map((event) => (event.id === eventId ? { ...event, ...patch } : event)),
            },
      ),
    );
  };

  const addEvent = (type: PaymentEventType) => {
    if (!selected) return;
    const event = emptyEvent({
      id: newEventId(type),
      type,
      amount: type === "pause" ? 0 : type === "annual" || type === "lumpSum" ? 3_000 : 250,
      start: values.start,
      end: type === "temporary" || type === "pause" ? addMonths(values.start, 12 * (type === "pause" ? 1 : 5) - 1) : undefined,
      calendarMonth: type === "annual" ? 12 : undefined,
      annualIncrease: type === "escalating" ? 0.03 : undefined,
      cadence: type === "paycheck" ? "biweekly" : undefined,
    });
    onStrategies(
      strategies.map((scenario) =>
        scenario.id !== selected.id ? scenario : { ...scenario, events: [...scenario.events, event] },
      ),
    );
  };

  const removeEvent = (eventId: string) => {
    if (!selected) return;
    onStrategies(
      strategies.map((scenario) =>
        scenario.id !== selected.id
          ? scenario
          : { ...scenario, events: scenario.events.filter((event) => event.id !== eventId) },
      ),
    );
  };

  return (
    <div className="space-y-5">
      <section className="card">
        <h2 className="font-serif text-xl leading-tight text-pine">Balance, rate, and the payment you make now</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          First result is instant. Use the remaining term, or switch to the principal-and-interest amount on your
          statement.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              ["term", "I know years left"],
              ["payment", "I know my P&I"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ ...values, entryMode: mode })}
              className={`inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold ${
                values.entryMode === mode
                  ? "bg-pine text-paper"
                  : "border border-pine/20 bg-paper text-pine hover:bg-pine/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-5 grid items-end gap-x-6 gap-y-6 sm:grid-cols-2">
          <PayoffField
            id="payoff-balance"
            label="Remaining balance"
            hint="What you still owe, not the original loan."
            kind="money"
            value={values.balance}
            onChange={(raw) => onChange({ ...values, balance: setNumber(raw, values.balance) })}
          />
          <PayoffField
            id="payoff-rate"
            label="Interest rate"
            hint="The note rate on the mortgage."
            kind="percent"
            value={values.annualRate}
            onChange={(raw) => onChange({ ...values, annualRate: setNumber(raw, values.annualRate * 100) / 100 })}
          />
          {values.entryMode === "term" ? (
            <>
              <PayoffField
                id="payoff-years"
                label="Years left"
                hint="Whole years remaining."
                kind="years"
                value={values.remainingYears}
                onChange={(raw) => onChange({ ...values, remainingYears: setNumber(raw, values.remainingYears) })}
              />
              <PayoffField
                id="payoff-months"
                label="Extra months"
                hint="0–11, on top of the years."
                kind="month"
                min={0}
                max={11}
                value={values.remainingMonths}
                onChange={(raw) => onChange({ ...values, remainingMonths: setNumber(raw, values.remainingMonths) })}
              />
            </>
          ) : (
            <PayoffField
              id="payoff-payment"
              label="Current P&I"
              hint="Principal and interest only. Not tax or insurance."
              kind="money"
              value={values.currentPayment}
              onChange={(raw) => onChange({ ...values, currentPayment: setNumber(raw, values.currentPayment) })}
            />
          )}
          <PayoffField
            id="payoff-start-year"
            label="First payment year"
            hint="The month extras are measured from."
            kind="years"
            value={values.start.year}
            onChange={(raw) =>
              onChange({ ...values, start: { ...values.start, year: Math.round(setNumber(raw, values.start.year)) } })
            }
          />
          <PayoffField
            id="payoff-start-month"
            label="First payment month"
            hint="1 is January."
            kind="month"
            min={1}
            max={12}
            value={values.start.month}
            onChange={(raw) =>
              onChange({ ...values, start: { ...values.start, month: Math.round(setNumber(raw, values.start.month)) } })
            }
          />
        </div>
        <p className="mt-4 text-sm text-muted">
          Scheduled P&I is {formatMoney(scheduledPayment)}. First payment month is {formatYearMonth(values.start)}.
        </p>
      </section>

      <section className="card">
        <h2 className="font-serif text-xl leading-tight text-pine">Quick extra</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Recurring extra to principal, starting now. Time reclaimed updates as you tap.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {EXTRA_PRESETS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => onChange({ ...values, extraMonthly: amount })}
              className={`inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold ${
                values.extraMonthly === amount
                  ? "bg-pine text-paper"
                  : "border border-pine/20 bg-paper text-pine hover:bg-pine/5"
              }`}
            >
              {amount === 0 ? "No extra" : `+${formatMoney(amount)} / mo`}
            </button>
          ))}
        </div>
        <label htmlFor="payoff-extra-slider" className="mt-5 block">
          <span className="block text-sm font-medium text-ink">Or slide to {formatMoney(values.extraMonthly)} / month</span>
          <input
            id="payoff-extra-slider"
            type="range"
            min={0}
            max={1500}
            step={25}
            value={values.extraMonthly}
            onChange={(event) => onChange({ ...values, extraMonthly: Number(event.target.value) })}
            className="mt-3 w-full accent-pine"
          />
        </label>
      </section>

      <AdSlot placement="form-break-1" />

      <DetailsCard title="Freedom date — what extra hits a date you choose">
        <p className="text-sm leading-relaxed text-muted">
          Pick the month you want to be mortgage-free. The solver finds the extra monthly principal that gets there.
        </p>
        <div className="mt-4 grid gap-x-5 gap-y-5 sm:grid-cols-2">
          <PayoffField
            id="payoff-freedom-year"
            label="Freedom year"
            kind="years"
            value={values.freedom.year}
            onChange={(raw) =>
              onChange({ ...values, freedom: { ...values.freedom, year: Math.round(setNumber(raw, values.freedom.year)) } })
            }
          />
          <PayoffField
            id="payoff-freedom-month"
            label="Freedom month"
            kind="month"
            min={1}
            max={12}
            value={values.freedom.month}
            onChange={(raw) =>
              onChange({
                ...values,
                freedom: { ...values.freedom, month: Math.round(setNumber(raw, values.freedom.month)) },
              })
            }
          />
        </div>
      </DetailsCard>

      <DetailsCard title="Strategy builder — monthly, annual, lumps, pauses">
        <p className="text-sm leading-relaxed text-muted">
          A strategy is a named pile of payment events, not a separate calculator. Compare up to three beside the
          baseline and the quick extra.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {strategies.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onSelect(scenario.id)}
              className={`inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold ${
                selectedId === scenario.id
                  ? "bg-pine text-paper"
                  : "border border-pine/20 bg-paper text-pine hover:bg-pine/5"
              }`}
            >
              {scenario.name}
            </button>
          ))}
        </div>
        {selected ? (
          <div className="mt-5 space-y-4">
            <label className="block text-sm font-medium text-ink" htmlFor={`payoff-rename-${selected.id}`}>
              Rename this plan
              <input
                id={`payoff-rename-${selected.id}`}
                value={selected.name}
                onChange={(event) =>
                  onStrategies(
                    strategies.map((scenario) =>
                      scenario.id === selected.id ? { ...scenario, name: event.target.value } : scenario,
                    ),
                  )
                }
                className="mt-1.5 h-11 w-full rounded-lg border border-pine/15 bg-paper px-3 text-ink outline-none ring-gold/40 focus:ring-2"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((row) => (
                <button
                  key={row.type}
                  type="button"
                  onClick={() => addEvent(row.type)}
                  className="inline-flex h-11 items-center rounded-full border border-pine/20 bg-paper px-3 text-sm text-pine hover:bg-pine/5"
                >
                  + {row.label}
                </button>
              ))}
            </div>
            {selected.events.length === 0 ? (
              <p className="text-sm text-muted">No events yet. Add a monthly extra or a lump sum.</p>
            ) : (
              <ul className="space-y-4">
                {selected.events.map((event) => (
                  <li key={event.id} className="rounded-xl border border-pine/10 bg-paper/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-ink">{EVENT_TYPES.find((row) => row.type === event.type)?.label}</p>
                      <button
                        type="button"
                        onClick={() => removeEvent(event.id)}
                        className="text-sm text-short underline-offset-2 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {event.type !== "pause" ? (
                        <PayoffField
                          id={`${event.id}-amount`}
                          label={event.type === "paycheck" ? "Amount each paycheck" : "Amount"}
                          kind="money"
                          value={event.amount}
                          onChange={(raw) => updateEvent(event.id, { amount: setNumber(raw, event.amount) })}
                        />
                      ) : null}
                      <PayoffField
                        id={`${event.id}-sy`}
                        label="Start year"
                        kind="years"
                        value={event.start.year}
                        onChange={(raw) =>
                          updateEvent(event.id, { start: { ...event.start, year: Math.round(setNumber(raw, event.start.year)) } })
                        }
                      />
                      <PayoffField
                        id={`${event.id}-sm`}
                        label="Start month"
                        kind="month"
                        min={1}
                        max={12}
                        value={event.start.month}
                        onChange={(raw) =>
                          updateEvent(event.id, {
                            start: { ...event.start, month: Math.round(setNumber(raw, event.start.month)) },
                          })
                        }
                      />
                      {event.type === "temporary" || event.type === "pause" ? (
                        <>
                          <PayoffField
                            id={`${event.id}-ey`}
                            label="End year"
                            kind="years"
                            value={event.end?.year ?? event.start.year}
                            onChange={(raw) =>
                              updateEvent(event.id, {
                                end: {
                                  year: Math.round(setNumber(raw, event.end?.year ?? event.start.year)),
                                  month: event.end?.month ?? event.start.month,
                                },
                              })
                            }
                          />
                          <PayoffField
                            id={`${event.id}-em`}
                            label="End month"
                            kind="month"
                            min={1}
                            max={12}
                            value={event.end?.month ?? event.start.month}
                            onChange={(raw) =>
                              updateEvent(event.id, {
                                end: {
                                  year: event.end?.year ?? event.start.year,
                                  month: Math.round(setNumber(raw, event.end?.month ?? event.start.month)),
                                },
                              })
                            }
                          />
                        </>
                      ) : null}
                      {event.type === "annual" ? (
                        <PayoffField
                          id={`${event.id}-cal`}
                          label="Calendar month"
                          hint="12 is December."
                          kind="month"
                          min={1}
                          max={12}
                          value={event.calendarMonth ?? 12}
                          onChange={(raw) => updateEvent(event.id, { calendarMonth: Math.round(setNumber(raw, 12)) })}
                        />
                      ) : null}
                      {event.type === "escalating" ? (
                        <PayoffField
                          id={`${event.id}-growth`}
                          label="Annual increase"
                          kind="percent"
                          value={event.annualIncrease ?? 0}
                          onChange={(raw) =>
                            updateEvent(event.id, { annualIncrease: setNumber(raw, (event.annualIncrease ?? 0) * 100) / 100 })
                          }
                        />
                      ) : null}
                      {event.type === "paycheck" ? (
                        <label className="flex min-w-0 flex-col gap-1.5">
                          <span className="text-sm font-medium text-ink">Paycheck cadence</span>
                          <select
                            value={event.cadence ?? "biweekly"}
                            onChange={(change) =>
                              updateEvent(event.id, {
                                cadence: change.target.value as "weekly" | "biweekly" | "semimonthly",
                              })
                            }
                            className="h-11 rounded-lg border border-pine/15 bg-paper px-3 text-ink outline-none ring-gold/40 focus:ring-2"
                          >
                            <option value="weekly">Weekly</option>
                            <option value="biweekly">Every two weeks</option>
                            <option value="semimonthly">1st and 15th</option>
                          </select>
                        </label>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </DetailsCard>

      <DetailsCard title="Timing lab and lender rules">
        <p className="text-sm leading-relaxed text-muted">
          The timing lab spends the same annual extra as monthly, quarterly, January, or December cash. Caps only flag
          a strategy — they do not change the math.
        </p>
        <div className="mt-4 grid gap-x-5 gap-y-5 sm:grid-cols-2">
          <PayoffField
            id="payoff-timing"
            label="Annual extra to time"
            hint="Compared four ways below the results."
            kind="money"
            value={values.timingAnnual}
            onChange={(raw) => onChange({ ...values, timingAnnual: setNumber(raw, values.timingAnnual) })}
          />
          <PayoffField
            id="payoff-lump-cap"
            label="Annual lump-sum limit"
            hint="0 means no stated cap."
            kind="money"
            value={values.lender.annualLumpLimit}
            onChange={(raw) =>
              onChange({ ...values, lender: { ...values.lender, annualLumpLimit: setNumber(raw, 0) } })
            }
          />
          <PayoffField
            id="payoff-monthly-cap"
            label="Max extra / month"
            hint="0 means no stated cap."
            kind="money"
            value={values.lender.maxMonthlyExtra}
            onChange={(raw) =>
              onChange({ ...values, lender: { ...values.lender, maxMonthlyExtra: setNumber(raw, 0) } })
            }
          />
        </div>
      </DetailsCard>
    </div>
  );
}
