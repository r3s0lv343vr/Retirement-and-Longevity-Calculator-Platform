"use client";

type Props = {
  savedAt: string | null;
  onSave: () => void;
  onLoad: () => void;
  onDelete: () => void;
  onExport: () => void;
};

export function LocalPlanControls({ savedAt, onSave, onLoad, onDelete, onExport }: Props) {
  return (
    <section className="card">
      <h3 className="font-serif text-xl text-pine">Save this plan on this device</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Saved locally in this browser. Runaway Finance does not receive or store this mortgage plan.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSave}
          className="inline-flex h-11 items-center rounded-full bg-pine px-4 text-sm font-semibold text-paper"
        >
          Save on this device
        </button>
        <button
          type="button"
          onClick={onLoad}
          className="inline-flex h-11 items-center rounded-full border border-pine/20 bg-paper px-4 text-sm font-semibold text-pine"
        >
          Restore saved plan
        </button>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex h-11 items-center rounded-full border border-pine/20 bg-paper px-4 text-sm font-semibold text-pine"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-11 items-center rounded-full border border-short/30 bg-paper px-4 text-sm font-semibold text-short"
        >
          Delete saved plan
        </button>
      </div>
      <p className="mt-3 text-xs text-muted">
        {savedAt ? `Last saved ${new Date(savedAt).toLocaleString()}.` : "No plan is stored in this browser yet."} Clearing
        site data removes it. It will not appear on another device.
      </p>
    </section>
  );
}
