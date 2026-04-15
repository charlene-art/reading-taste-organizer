import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  filterBooks,
  listBooksWithLatestAnalysis,
} from "@/lib/books-query";
import { getLatestClusterRun } from "@/lib/cluster-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const theme = searchParams.get("theme") ?? undefined;
  const tone = searchParams.get("tone") ?? undefined;
  const cluster = searchParams.get("cluster") ?? undefined;

  const [books, run] = await Promise.all([
    listBooksWithLatestAnalysis(),
    getLatestClusterRun(),
  ]);

  let clusterLabels: Record<string, number> | null = null;
  if (run?.labelsJson) {
    clusterLabels = JSON.parse(run.labelsJson) as Record<string, number>;
  }

  const filtered = filterBooks(books, {
    q,
    theme,
    tone,
    cluster,
    clusterLabels,
  });

  return NextResponse.json({
    books: filtered,
    clusterLabels,
    clusterNames: run?.namesJson
      ? (JSON.parse(run.namesJson) as Record<string, string>)
      : null,
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    title?: string;
    author?: string;
    readDate?: string | null;
    notes?: string;
  };

  const title = body.title?.trim();
  const author = body.author?.trim();
  if (!title || !author) {
    return NextResponse.json(
      { error: "title and author are required" },
      { status: 400 },
    );
  }

  let readDate: Date | null = null;
  if (body.readDate) {
    const d = new Date(body.readDate);
    if (!Number.isNaN(d.getTime())) readDate = d;
  }

  const book = await prisma.book.create({
    data: {
      title,
      author,
      readDate,
      notes: body.notes?.trim() ?? "",
    },
  });

  return NextResponse.json({ book });
}
