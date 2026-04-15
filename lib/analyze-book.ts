import { getOpenAI } from "@/lib/openai-client";
import { llmAnalysisSchema, type LlmAnalysis } from "@/lib/schemas";

const SYSTEM = `You are a careful literary assistant. Given a book title, author, and optional user notes, produce structured reading analysis.

Rules:
- If user notes are empty or very short, infer cautiously from title and author reputation only; still output plausible themes/tones/patterns but keep them general.
- themes: 3–8 short noun phrases (e.g. "grief and memory", "class mobility").
- tones: 2–5 mood descriptors (e.g. "melancholic", "witty").
- plotPatterns: 3–8 common narrative / trope patterns (e.g. "unreliable narrator", "found family").
- summary: 2–4 sentences, neutral and spoiler-light unless notes explicitly include spoilers.

Respond with JSON only matching the schema.`;

function userPrompt(input: {
  title: string;
  author: string;
  notes: string;
}): string {
  return JSON.stringify(
    {
      title: input.title,
      author: input.author,
      notes: input.notes.trim() || null,
    },
    null,
    2,
  );
}

export async function runStructuredAnalysis(input: {
  title: string;
  author: string;
  notes: string;
}): Promise<{ analysis: LlmAnalysis; inferredOnly: boolean; model: string }> {
  const inferredOnly = input.notes.trim().length < 24;
  const openai = getOpenAI();
  const model = process.env.OPENAI_ANALYSIS_MODEL ?? "gpt-4o-mini";

  const response = await openai.chat.completions.create({
    model,
    temperature: 0.4,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "book_analysis",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["summary", "themes", "tones", "plotPatterns"],
          properties: {
            summary: { type: "string" },
            themes: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
              maxItems: 12,
            },
            tones: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
              maxItems: 8,
            },
            plotPatterns: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
              maxItems: 12,
            },
          },
        },
      },
    },
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: userPrompt(input) },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("Empty response from model");
  }

  const parsed = JSON.parse(raw) as unknown;
  const analysis = llmAnalysisSchema.parse(parsed);

  return { analysis, inferredOnly, model };
}

export function canonicalEmbeddingText(a: LlmAnalysis): string {
  return [
    a.summary,
    "Themes:",
    ...a.themes,
    "Tones:",
    ...a.tones,
    "Plot patterns:",
    ...a.plotPatterns,
  ].join("\n");
}

export async function embedAnalysisText(text: string): Promise<number[]> {
  const openai = getOpenAI();
  const model = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
  const res = await openai.embeddings.create({
    model,
    input: text,
  });
  const vec = res.data[0]?.embedding;
  if (!vec) {
    throw new Error("No embedding returned");
  }
  return vec;
}
