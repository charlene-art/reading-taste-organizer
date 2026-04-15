import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseAnalysis } from "@/lib/parse-analysis";
import { getLatestClusterRun } from "@/lib/cluster-service";
import { updateBook } from "@/app/actions/books";
import { AnalyzeButton } from "@/components/AnalyzeButton";

type Params = { params: Promise<{ id: string }> };

function formatDate(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function BookDetailPage({ params }: Params) {
  const { id } = await params;
  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      analyses: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!book) notFound();

  const analysis = book.analyses[0]
    ? parseAnalysis(book.analyses[0])
    : null;

  const run = await getLatestClusterRun();
  let clusterLabel: string | null = null;
  if (run?.labelsJson && run.namesJson) {
    const labels = JSON.parse(run.labelsJson) as Record<string, number>;
    const names = JSON.parse(run.namesJson) as Record<string, string>;
    const idx = labels[book.id];
    if (idx !== undefined) {
      clusterLabel = names[String(idx)] ?? names[idx];
    }
  }

  const boundUpdate = updateBook.bind(null, book.id);

  return (
    <div className="space-y-10">
      <div>
        <Link href="/" className="text-sm text-[var(--muted)] hover:underline">
          ← Library
        </Link>
        <h2 className="mt-4 text-xl font-semibold">{book.title}</h2>
        <p className="text-[var(--muted)]">{book.author}</p>
      </div>

      <section>
        <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
          Edit
        </h3>
        <form action={boundUpdate} className="max-w-lg space-y-4">
          <label className="block text-sm">
            <span className="text-[var(--muted)]">Title</span>
            <input
              name="title"
              required
              defaultValue={book.title}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted)]">Author</span>
            <input
              name="author"
              required
              defaultValue={book.author}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted)]">Date read</span>
            <input
              type="date"
              name="readDate"
              defaultValue={formatDate(book.readDate)}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted)]">Notes</span>
            <textarea
              name="notes"
              rows={6}
              defaultValue={book.notes}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 outline-none focus:border-[var(--accent)]"
            />
          </label>
          <button
            type="submit"
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm hover:bg-white/5"
          >
            Save changes
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">
          AI analysis
        </h3>
        <AnalyzeButton bookId={book.id} />
        {analysis?.inferredOnly && (
          <p className="text-sm text-amber-200/90">
            Labels were inferred from title and author only. Add richer notes
            and analyze again for better accuracy.
          </p>
        )}
        {clusterLabel && (
          <p className="text-sm text-[var(--muted)]">
            Latest cluster:{" "}
            <span className="text-[var(--foreground)]">{clusterLabel}</span>
          </p>
        )}
        {analysis ? (
          <div className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-sm">
            <div>
              <h4 className="font-medium text-[var(--muted)]">Summary</h4>
              <p className="mt-1 leading-relaxed">{analysis.summary}</p>
            </div>
            <div>
              <h4 className="font-medium text-[var(--muted)]">Themes</h4>
              <ul className="mt-1 flex flex-wrap gap-2">
                {analysis.themes.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-[var(--border)] px-2 py-0.5"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-[var(--muted)]">Tone</h4>
              <ul className="mt-1 flex flex-wrap gap-2">
                {analysis.tones.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-[var(--border)] px-2 py-0.5"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-[var(--muted)]">
                Plot / trope patterns
              </h4>
              <ul className="mt-1 flex flex-wrap gap-2">
                {analysis.plotPatterns.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-[var(--border)] px-2 py-0.5"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-[var(--muted)]">
              Model: {analysis.model}
            </p>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            No analysis yet. Click &quot;Analyze with AI&quot; to generate
            themes, tone, and patterns.
          </p>
        )}
      </section>
    </div>
  );
}
