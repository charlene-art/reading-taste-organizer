import { prisma } from "@/lib/db";

export type ClusterGroup = {
  index: number;
  label: string;
  books: { id: string; title: string; author: string }[];
};

export async function getClusterGroups(): Promise<ClusterGroup[]> {
  const run = await prisma.clusterRun.findFirst({
    orderBy: { createdAt: "desc" },
  });
  if (!run?.labelsJson || !run.namesJson) return [];

  const labels = JSON.parse(run.labelsJson) as Record<string, number>;
  const names = JSON.parse(run.namesJson) as Record<string, string>;

  const byCluster = new Map<number, string[]>();
  for (const [bookId, idx] of Object.entries(labels)) {
    const list = byCluster.get(idx) ?? [];
    list.push(bookId);
    byCluster.set(idx, list);
  }

  const books = await prisma.book.findMany({
    where: { id: { in: Object.keys(labels) } },
    select: { id: true, title: true, author: true },
  });
  const bookMap = new Map(books.map((b) => [b.id, b]));

  const groups: ClusterGroup[] = [];
  const sortedIdx = [...byCluster.keys()].sort((a, b) => a - b);
  for (const idx of sortedIdx) {
    const ids = byCluster.get(idx) ?? [];
    groups.push({
      index: idx,
      label: names[String(idx)] ?? names[idx] ?? `Cluster ${idx}`,
      books: ids
        .map((id) => bookMap.get(id))
        .filter(Boolean) as { id: string; title: string; author: string }[],
    });
  }

  return groups;
}
