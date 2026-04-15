import { prisma } from "@/lib/db";
import { getOpenAI } from "@/lib/openai-client";
import { parseAnalysis } from "@/lib/parse-analysis";

function countThemes(
  lists: string[][],
): { theme: string; count: number }[] {
  const m = new Map<string, { display: string; count: number }>();
  for (const list of lists) {
    for (const t of list) {
      const key = t.trim().toLowerCase();
      if (!key) continue;
      const cur = m.get(key);
      if (cur) cur.count += 1;
      else m.set(key, { display: t.trim(), count: 1 });
    }
  }
  return [...m.values()]
    .sort((a, b) => b.count - a.count)
    .map(({ display, count }) => ({ theme: display, count }));
}

export async function generateWritingPrompts(): Promise<string[]> {
  const books = await prisma.book.findMany({
    include: {
      analyses: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const themeLists: string[][] = [];
  const toneLists: string[][] = [];
  for (const b of books) {
    const a = b.analyses[0];
    if (!a) continue;
    const p = parseAnalysis(a);
    themeLists.push(p.themes);
    toneLists.push(p.tones);
  }

  if (themeLists.length === 0) {
    throw new Error("No analyzed books yet.");
  }

  const topThemes = countThemes(themeLists).slice(0, 15);
  const topTones = countThemes(toneLists).slice(0, 10);

  const openai = getOpenAI();
  const model = process.env.OPENAI_PROMPTS_MODEL ?? "gpt-4o-mini";

  const res = await openai.chat.completions.create({
    model,
    temperature: 0.85,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "writing_prompts",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["prompts"],
          properties: {
            prompts: {
              type: "array",
              items: { type: "string" },
              minItems: 5,
              maxItems: 8,
            },
          },
        },
      },
    },
    messages: [
      {
        role: "system",
        content:
          "You help fiction writers. Output short, evocative writing prompts (1-3 sentences each) inspired by the reader's taste themes and tones. No numbering in the strings.",
      },
      {
        role: "user",
        content: JSON.stringify(
          {
            topThemes,
            topTones,
            bookCount: themeLists.length,
          },
          null,
          2,
        ),
      },
    ],
  });

  const raw = res.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty prompts response");
  const parsed = JSON.parse(raw) as { prompts: string[] };
  return parsed.prompts;
}
