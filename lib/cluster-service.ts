import { prisma } from "@/lib/db";
import { getOpenAI } from "@/lib/openai-client";
import { kMeansCosine, suggestK } from "@/lib/clustering";
import { labelClusterFromThemes } from "@/lib/cluster-labels";
import { parseAnalysis } from "@/lib/parse-analysis";

export type ClusterPayload = {
  runId: string;
  k: number;
  labels: Record<string, number>;
  names: Record<number, string>;
  bookIds: string[];
};

async function shortNameFromLlm(themesSample: string[]): Promise<string | null> {
  try {
    const openai = getOpenAI();
    const model = process.env.OPENAI_CLUSTER_MODEL ?? "gpt-4o-mini";
    const res = await openai.chat.completions.create({
      model,
      temperature: 0.3,
      max_tokens: 40,
      messages: [
        {
          role: "user",
          content: `Given these recurring theme phrases from books in one cluster, reply with a short human-readable cluster name (max 6 words), no quotes:\n${themesSample.slice(0, 12).join("; ")}`,
        },
      ],
    });
    const text = res.choices[0]?.message?.content?.trim();
    return text && text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

export async function runClustering(requestedK?: number): Promise<ClusterPayload> {
  const books = await prisma.book.findMany({
    include: {
      analyses: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "asc" },
  });

  const withEmb: { bookId: string; vec: number[]; themes: string[] }[] = [];
  for (const b of books) {
    const a = b.analyses[0];
    if (!a?.embeddingJson) continue;
    const parsed = parseAnalysis(a);
    if (!parsed.embedding?.length) continue;
    withEmb.push({
      bookId: b.id,
      vec: parsed.embedding,
      themes: parsed.themes,
    });
  }

  const n = withEmb.length;
  if (n === 0) {
    throw new Error("No books with embeddings yet. Analyze at least one book.");
  }

  const k = requestedK ?? suggestK(n);
  const { assignments } = kMeansCosine(
    withEmb.map((x) => x.vec),
    k,
  );

  const labels: Record<string, number> = {};
  const byCluster = new Map<number, string[][]>();
  for (let i = 0; i < n; i++) {
    const bookId = withEmb[i].bookId;
    const c = assignments[i];
    labels[bookId] = c;
    const list = byCluster.get(c) ?? [];
    list.push(withEmb[i].themes);
    byCluster.set(c, list);
  }

  const names: Record<number, string> = {};
  const useLlm = process.env.OPENAI_CLUSTER_LLM_NAMES !== "0";
  for (const [idx, themeLists] of byCluster.entries()) {
    const fallback = labelClusterFromThemes(themeLists);
    if (useLlm) {
      const flat = themeLists.flat();
      const llm = await shortNameFromLlm(flat);
      names[idx] = llm ?? fallback;
    } else {
      names[idx] = fallback;
    }
  }

  const uniqueClusters = new Set(assignments).size;

  const run = await prisma.clusterRun.create({
    data: {
      k: uniqueClusters || k,
      labelsJson: JSON.stringify(labels),
      namesJson: JSON.stringify(names),
    },
  });

  return {
    runId: run.id,
    k: run.k,
    labels,
    names,
    bookIds: withEmb.map((x) => x.bookId),
  };
}

export async function getLatestClusterRun() {
  return prisma.clusterRun.findFirst({
    orderBy: { createdAt: "desc" },
  });
}
