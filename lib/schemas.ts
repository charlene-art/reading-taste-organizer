import { z } from "zod";

export const llmAnalysisSchema = z.object({
  summary: z.string().min(1).max(4000),
  themes: z.array(z.string().min(1).max(120)).min(1).max(12),
  tones: z.array(z.string().min(1).max(80)).min(1).max(8),
  plotPatterns: z.array(z.string().min(1).max(120)).min(1).max(12),
});

export type LlmAnalysis = z.infer<typeof llmAnalysisSchema>;
