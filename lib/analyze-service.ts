import { prisma } from "@/lib/db";
import {
  canonicalEmbeddingText,
  embedAnalysisText,
  runStructuredAnalysis,
} from "@/lib/analyze-book";
import { parseAnalysis } from "@/lib/parse-analysis";

export async function analyzeBookById(bookId: string) {
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    throw new Error("Book not found");
  }

  const { analysis, inferredOnly, model } = await runStructuredAnalysis({
    title: book.title,
    author: book.author,
    notes: book.notes,
  });

  const embedText = canonicalEmbeddingText(analysis);
  const embedding = await embedAnalysisText(embedText);

  await prisma.bookAnalysis.deleteMany({ where: { bookId } });

  const row = await prisma.bookAnalysis.create({
    data: {
      bookId,
      summary: analysis.summary,
      themesJson: JSON.stringify(analysis.themes),
      toneJson: JSON.stringify(analysis.tones),
      plotPatternsJson: JSON.stringify(analysis.plotPatterns),
      embeddingJson: JSON.stringify(embedding),
      model,
      inferredOnly,
    },
  });

  return { book, analysis: parseAnalysis(row) };
}
