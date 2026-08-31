"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminActions() {
  const router = useRouter();
  const [busy, setBusy] = useState<"refresh" | "out" | null>(null);

  async function refresh() {
    setBusy("refresh");
    router.refresh();
    setTimeout(() => setBusy(null), 400);
  }

  async function logout() {
    setBusy("out");
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => void refresh()}
        disabled={busy !== null}
        className="inline-flex h-10 items-center rounded-full border border-pine/20 bg-white px-4 text-sm font-semibold text-pine transition hover:bg-paper-2 disabled:opacity-60"
      >
        {busy === "refresh" ? "Refreshing…" : "Refresh counts"}
      </button>
      <button
        type="button"
        onClick={() => void logout()}
        disabled={busy !== null}
        className="inline-flex h-10 items-center rounded-full bg-pine px-4 text-sm font-semibold text-paper transition hover:bg-pine-2 disabled:opacity-60"
      >
        {busy === "out" ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
