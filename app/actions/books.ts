"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function createBook(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const readDateRaw = String(formData.get("readDate") ?? "").trim();

  if (!title || !author) {
    throw new Error("Title and author are required");
  }

  let readDate: Date | null = null;
  if (readDateRaw) {
    const d = new Date(readDateRaw);
    if (!Number.isNaN(d.getTime())) readDate = d;
  }

  const book = await prisma.book.create({
    data: { title, author, notes, readDate },
  });

  redirect(`/books/${book.id}`);
}

export async function updateBook(bookId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const readDateRaw = String(formData.get("readDate") ?? "").trim();

  if (!title || !author) {
    throw new Error("Title and author are required");
  }

  let readDate: Date | null = null;
  if (readDateRaw) {
    const d = new Date(readDateRaw);
    if (!Number.isNaN(d.getTime())) readDate = d;
  } else {
    readDate = null;
  }

  await prisma.book.update({
    where: { id: bookId },
    data: { title, author, notes, readDate },
  });

  redirect(`/books/${bookId}`);
}
