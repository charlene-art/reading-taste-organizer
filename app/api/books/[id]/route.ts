import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      analyses: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!book) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ book });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json()) as {
    title?: string;
    author?: string;
    readDate?: string | null;
    notes?: string;
  };

  const existing = await prisma.book.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let readDate: Date | null | undefined = undefined;
  if (body.readDate !== undefined) {
    if (body.readDate === null || body.readDate === "") readDate = null;
    else {
      const d = new Date(body.readDate);
      readDate = Number.isNaN(d.getTime()) ? existing.readDate : d;
    }
  }

  const book = await prisma.book.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.author !== undefined && { author: body.author.trim() }),
      ...(readDate !== undefined && { readDate }),
      ...(body.notes !== undefined && { notes: body.notes.trim() }),
    },
  });

  return NextResponse.json({ book });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.book.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
