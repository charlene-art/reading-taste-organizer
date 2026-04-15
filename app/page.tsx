import Link from "next/link";
import { listBooksWithLatestAnalysis, filterBooks } from "@/lib/books-query";
import { getLatestClusterRun } from "@/lib/cluster-service";
import { LibraryFilters } from "@/components/LibraryFilters";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const theme = typeof sp.theme === "string" ? sp.theme : "";
  const tone = typeof sp.tone === "string" ? sp.tone : "";
  const cluster = typeof sp.cluster === "string" ? sp.cluster : "";

  const [books, run] = await Promise.all([
    listBooksWithLatestAnalysis(),
    getLatestClusterRun(),
  ]);

  let clusterLabels: Record<string, number> | null = null;
  let clusterNames: Record<string, string> | null = null;
  if (run?.labelsJson) {
    clusterLabels = JSON.parse(run.labelsJson) as Record<string, number>;
  }
  if (run?.namesJson) {
    clusterNames = JSON.parse(run.namesJson) as Record<string, string>;
  }

  const filtered = filterBooks(books, {
    q,
    theme,
    tone,
    cluster,
    clusterLabels,
  });

  return (
    <div>
      <LibraryFilters
        initial={{ q, theme, tone, cluster }}
        clusterNames={clusterNames}
        hasClusterRun={!!run}
      />

      {filtered.length === 0 ? (
        <p className="text-[var(--muted)]">
          No books match.{" "}
          <Link href="/books/new" className="text-[var(--accent)]">
            Add a book
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--card)]">
          {filtered.map((b) => {
            const cl =
              clusterLabels && b.id in clusterLabels
                ? clusterLabels[b.id]
                : null;
            const clName =
              cl !== null && clusterNames
                ? clusterNames[String(cl)] ?? clusterNames[cl]
                : null;
            return (
              <li key={b.id}>
                <Link
                  href={`/books/${b.id}`}
                  className="flex flex-col gap-1 px-4 py-4 transition-colors hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <span className="font-medium">{b.title}</span>
                    <span className="text-[var(--muted)]"> — {b.author}</span>
                    {b.analysis?.inferredOnly && (
                      <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 text-xs text-amber-200">
                        inferred
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                    {clName && (
                      <span className="rounded border border-[var(--border)] px-2 py-0.5">
                        {clName}
                      </span>
                    )}
                    {b.analysis?.themes.slice(0, 2).map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
