"use client";

import { useState, type FormEvent } from "react";
import { MIN_PASSWORD_LENGTH } from "@/lib/admin/constants";

export function AdminSetupForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirm }),
      });
      const data = (await response.json()) as { error?: string; login?: boolean };
      if (response.status === 409 || data.login) {
        window.location.assign("/admin/login");
        return;
      }
      if (!response.ok) {
        setError(data.error || "Could not save the password.");
        return;
      }
      window.location.assign("/admin");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto mt-16 max-w-md">
      <h1 className="font-serif text-2xl text-pine">Create admin password</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Set this once. On a normal server it is stored hashed in{" "}
        <code className="text-ink">.data/admin.json</code>. On Vercel that file cannot stick, so this browser also keeps
        a hashed copy so you can sign back in here. You do not need a Vercel environment variable.
      </p>
      <p className="mt-3 text-xs text-muted">
        The first person to complete this form owns the admin. Do it right after you deploy. At least{" "}
        {MIN_PASSWORD_LENGTH} characters.
      </p>
      <label htmlFor="setup-password" className="mt-6 flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">Password</span>
        <input
          id="setup-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-11 w-full rounded-lg border border-pine/15 bg-paper px-3 text-ink outline-none ring-gold/40 focus:ring-2"
        />
      </label>
      <label htmlFor="setup-confirm" className="mt-4 flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">Confirm password</span>
        <input
          id="setup-confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className="h-11 w-full rounded-lg border border-pine/15 bg-paper px-3 text-ink outline-none ring-gold/40 focus:ring-2"
        />
      </label>
      {error ? (
        <p className="mt-3 rounded-xl border border-short/30 bg-short/10 px-4 py-3 text-sm text-short" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-pine px-6 text-sm font-semibold text-paper shadow-sm transition hover:bg-pine-2 disabled:opacity-60"
      >
        {loading ? "Saving…" : "Save password and continue"}
      </button>
    </form>
  );
}
