import { prisma } from "@/lib/db";
import { parseAnalysis } from "@/lib/parse-analysis";

export type CountRow = { name: string; count: number };

function countStrings(lists: string[][]): CountRow[] {
  const m = new Map<string, number>();
  for (const list of lists) {
    for (const s of list) {
      const k = s.trim();
      if (!k) continue;
      m.set(k, (m.get(k) ?? 0) + 1);
    }
  }
  return [...m.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getInsightAggregates(): Promise<{
  toneCounts: CountRow[];
  plotPatternCounts: CountRow[];
  themeCounts: CountRow[];
  analyzedBookCount: number;
}> {
  const books = await prisma.book.findMany({
    include: {
      analyses: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const toneLists: string[][] = [];
  const plotLists: string[][] = [];
  const themeLists: string[][] = [];
  let analyzed = 0;

  for (const b of books) {
    const a = b.analyses[0];
    if (!a) continue;
    analyzed++;
    const p = parseAnalysis(a);
    toneLists.push(p.tones);
    plotLists.push(p.plotPatterns);
    themeLists.push(p.themes);
  }

  return {
    toneCounts: countStrings(toneLists),
    plotPatternCounts: countStrings(plotLists),
    themeCounts: countStrings(themeLists),
    analyzedBookCount: analyzed,
  };
}
