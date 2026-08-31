"use client";

import { useState, type FormEvent } from "react";

export function AdminPasswordForm({ envLocked }: { envLocked: boolean }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  if (envLocked) {
    return (
      <p className="text-sm text-muted">
        This host is using the optional <code className="text-ink">ADMIN_PASSWORD</code> environment variable, so the
        password is not changed here.
      </p>
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next, confirm }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Could not change the password.");
        return;
      }
      setCurrent("");
      setNext("");
      setConfirm("");
      setSaved(true);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid max-w-md gap-3">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink">Current password</span>
        <input
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
          className="h-11 rounded-lg border border-pine/15 bg-paper px-3 outline-none ring-gold/40 focus:ring-2"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink">New password</span>
        <input
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(event) => setNext(event.target.value)}
          className="h-11 rounded-lg border border-pine/15 bg-paper px-3 outline-none ring-gold/40 focus:ring-2"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink">Confirm new password</span>
        <input
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className="h-11 rounded-lg border border-pine/15 bg-paper px-3 outline-none ring-gold/40 focus:ring-2"
        />
      </label>
      {error ? (
        <p className="rounded-xl border border-short/30 bg-short/10 px-4 py-3 text-sm text-short" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? <p className="text-sm text-pine">Password updated.</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-11 items-center justify-center rounded-full bg-pine px-5 text-sm font-semibold text-paper transition hover:bg-pine-2 disabled:opacity-60"
      >
        {loading ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
