"use client";

import { useState } from "react";
import type { ChildEstimate } from "@/lib/child/estimateChild";

type Props = {
  result: ChildEstimate;
};

export function ChildCompileDownloadButton({ result }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function compileAndDownload() {
    setBusy(true);
    setError(null);
    try {
      const { downloadChildPdf } = await import("@/lib/report/compileChildPdf");
      downloadChildPdf(result);
    } catch {
      setError("Could not compile the PDF. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Download</p>
      <h3 className="mt-2 font-serif text-2xl text-pine">Compile this outlook</h3>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
        Builds a PDF of the completed report in your browser — the train of thought, both nest eggs, every year of
        costs and pot balances, and the inputs you used. Nothing is stored on a server.
      </p>
      <button
        type="button"
        onClick={() => void compileAndDownload()}
        disabled={busy}
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-pine px-6 text-sm font-semibold text-paper shadow-sm transition hover:bg-pine-2 disabled:opacity-60 sm:w-auto"
      >
        {busy ? "Compiling report…" : "Compile and Download Report"}
      </button>
      {error ? (
        <p className="mt-3 text-sm text-short" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
