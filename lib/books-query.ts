import { prisma } from "@/lib/db";
import { parseAnalysis, type ParsedAnalysis } from "@/lib/parse-analysis";

export type BookWithAnalysis = {
  id: string;
  title: string;
  author: string;
  readDate: Date | null;
  notes: string;
  createdAt: Date;
  analysis: ParsedAnalysis | null;
};

export async function listBooksWithLatestAnalysis(): Promise<BookWithAnalysis[]> {
  const books = await prisma.book.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      analyses: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return books.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    readDate: b.readDate,
    notes: b.notes,
    createdAt: b.createdAt,
    analysis: b.analyses[0] ? parseAnalysis(b.analyses[0]) : null,
  }));
}

export function filterBooks(
  books: BookWithAnalysis[],
  filters: {
    q?: string;
    theme?: string;
    tone?: string;
    cluster?: string;
    clusterLabels?: Record<string, number> | null;
  },
): BookWithAnalysis[] {
  let out = books;
  const q = filters.q?.trim().toLowerCase();
  if (q) {
    out = out.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q),
    );
  }
  const theme = filters.theme?.trim().toLowerCase();
  if (theme) {
    out = out.filter((b) =>
      b.analysis?.themes.some((t) => t.toLowerCase().includes(theme)),
    );
  }
  const tone = filters.tone?.trim().toLowerCase();
  if (tone) {
    out = out.filter((b) =>
      b.analysis?.tones.some((t) => t.toLowerCase().includes(tone)),
    );
  }
  if (filters.cluster !== undefined && filters.cluster !== "") {
    const idx = Number.parseInt(filters.cluster, 10);
    if (!Number.isNaN(idx) && filters.clusterLabels) {
      out = out.filter((b) => filters.clusterLabels![b.id] === idx);
    }
  }
  return out;
}
