import { NextResponse } from "next/server";
import { analyzeBookById } from "@/lib/analyze-service";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const result = await analyzeBookById(id);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Analysis failed";
    const status =
      message === "Book not found" ? 404 : message.includes("OPENAI") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
