"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Props = {
  /** Books that have an embedding (same pool clustering uses). */
  booksWithEmbeddings: number;
  /** Default k from suggestK(booksWithEmbeddings). */
  suggestedK: number;
};

export function ClusterRecomputeToolbar({
  booksWithEmbeddings,
  suggestedK,
}: Props) {
  const router = useRouter();
  const [k, setK] = useState(suggestedK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kOptions = useMemo(() => {
    const max = Math.min(8, Math.max(2, booksWithEmbeddings));
    const out: number[] = [];
    for (let i = 2; i <= max; i++) out.push(i);
    return out;
  }, [booksWithEmbeddings]);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cluster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ k }),
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

  if (booksWithEmbeddings < 2) {
    return null;
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <span>Number of groups</span>
          <select
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
            className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          >
            {kOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
                {opt === suggestedK ? " (suggested)" : ""}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-50"
        >
          {loading ? "Clustering…" : "Recompute clusters"}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
