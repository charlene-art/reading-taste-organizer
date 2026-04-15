import type { BookAnalysis } from "@prisma/client";

export type ParsedAnalysis = {
  id: string;
  summary: string;
  themes: string[];
  tones: string[];
  plotPatterns: string[];
  embedding: number[] | null;
  model: string;
  inferredOnly: boolean;
  createdAt: Date;
};

export function parseAnalysis(row: BookAnalysis): ParsedAnalysis {
  return {
    id: row.id,
    summary: row.summary,
    themes: JSON.parse(row.themesJson) as string[],
    tones: JSON.parse(row.toneJson) as string[],
    plotPatterns: JSON.parse(row.plotPatternsJson) as string[],
    embedding: row.embeddingJson
      ? (JSON.parse(row.embeddingJson) as number[])
      : null,
    model: row.model,
    inferredOnly: row.inferredOnly,
    createdAt: row.createdAt,
  };
}
