import type { PlanSnapshot } from "@/lib/engine";
import { formatMoney, formatMonths } from "@/lib/format";

export function PlanSnapshotCard({
  label,
  snapshot,
  note,
}: {
  label: string;
  snapshot: PlanSnapshot | null;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-pine/10 bg-paper/60 p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      {snapshot ? (
        <>
          <p className="mt-2 text-xs uppercase tracking-wide text-muted">Funded through age</p>
          <p className="mt-1 font-serif text-3xl text-ink">{snapshot.fundedThroughAge}</p>
          <p className="mt-2 text-sm text-ink/85">
            {snapshot.yearsCovered} of {snapshot.yearsInRetirement} retirement years
          </p>
          <p className="mt-1 text-xs text-muted">
            {formatMonths(snapshot.accumulatedMonths)} accumulated / {formatMonths(snapshot.requiredMonths)} required
          </p>
          <p className="mt-2 text-xs text-muted">
            {snapshot.depleted
              ? snapshot.remainingExpenseNeed > 0
                ? `Still needed after capital runs out: ${formatMoney(snapshot.remainingExpenseNeed)}`
                : "Savings depleted"
              : `Savings remaining: ${formatMoney(snapshot.remainingSavings)}`}
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm text-muted">Enter a valid value to compare.</p>
      )}
      <p className="mt-3 text-xs text-muted">{note}</p>
    </div>
  );
}
