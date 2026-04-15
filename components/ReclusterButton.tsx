"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReclusterButton({ k }: { k?: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cluster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(k ? { k } : {}),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Clustering failed");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="rounded-md border border-[var(--border)] px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-50"
      >
        {loading ? "Clustering…" : "Recompute clusters"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
