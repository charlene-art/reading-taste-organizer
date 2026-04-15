import Link from "next/link";
import { getInsightAggregates } from "@/lib/insights-stats";
import { getClusterGroups } from "@/lib/cluster-display";
import { ToneBarChart, PlotPatternBarChart } from "@/components/InsightCharts";
import { ReclusterButton } from "@/components/ReclusterButton";
import { WritingPromptsButton } from "@/components/WritingPromptsButton";

/** Always read fresh DB data (Vercel otherwise prerenders this page at build time). */
export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const [agg, clusters] = await Promise.all([
    getInsightAggregates(),
    getClusterGroups(),
  ]);

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-lg font-medium">Overview</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {agg.analyzedBookCount} book
          {agg.analyzedBookCount === 1 ? "" : "s"} with AI analysis.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-medium">Thematic clusters</h2>
          <ReclusterButton />
        </div>
        <p className="text-sm text-[var(--muted)]">
          Clusters are computed from embeddings of each book&apos;s analysis.
          Analyze books first, then recompute. Names combine frequent themes and
          a short model label when enabled.
        </p>
        {clusters.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            No cluster run yet. Add and analyze books, then click &quot;Recompute
            clusters&quot;.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {clusters.map((c) => (
              <div
                key={c.index}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
              >
                <h3 className="font-medium">{c.label}</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {c.books.map((b) => (
                    <li key={b.id}>
                      <Link href={`/books/${b.id}`} className="hover:underline">
                        {b.title}
                      </Link>
                      <span className="text-[var(--muted)]"> — {b.author}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-medium">Tone distribution</h2>
          <ToneBarChart data={agg.toneCounts} />
        </div>
        <div>
          <h2 className="mb-4 text-lg font-medium">Plot / trope patterns</h2>
          <PlotPatternBarChart data={agg.plotPatternCounts} />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">Top themes (frequency)</h2>
        <ul className="flex flex-wrap gap-2 text-sm">
          {agg.themeCounts.slice(0, 24).map((t) => (
            <li
              key={t.name}
              className="rounded-full border border-[var(--border)] px-3 py-1"
            >
              {t.name}{" "}
              <span className="text-[var(--muted)]">({t.count})</span>
            </li>
          ))}
        </ul>
        {agg.themeCounts.length === 0 && (
          <p className="text-sm text-[var(--muted)]">No themes yet.</p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Writing prompts</h2>
        <p className="text-sm text-[var(--muted)]">
          Optional: generate prompts grounded in your aggregated themes and
          tones.
        </p>
        <WritingPromptsButton />
      </section>
    </div>
  );
}
