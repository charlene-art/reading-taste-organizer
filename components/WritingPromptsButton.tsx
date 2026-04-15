"use client";

import { useState } from "react";

export function WritingPromptsButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<string[] | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/prompts", { method: "POST" });
      const data = (await res.json()) as { prompts?: string[]; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not generate prompts");
      }
      setPrompts(data.prompts ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-muted)] disabled:opacity-50"
      >
        {loading ? "Generating…" : "Generate writing prompts"}
      </button>
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      {prompts && prompts.length > 0 && (
        <ul className="list-inside list-decimal space-y-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-sm leading-relaxed">
          {prompts.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
