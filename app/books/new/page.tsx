import Link from "next/link";
import { createBook } from "@/app/actions/books";

export default function NewBookPage() {
  return (
    <div className="max-w-lg">
      <h2 className="mb-6 text-lg font-medium">Add a book</h2>
      <form action={createBook} className="space-y-4">
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Title</span>
          <input
            name="title"
            required
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Author</span>
          <input
            name="author"
            required
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">Date read (optional)</span>
          <input
            type="date"
            name="readDate"
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">
            Your notes (recommended for better analysis)
          </span>
          <textarea
            name="notes"
            rows={5}
            placeholder="Impressions, favorite scenes, why you picked it up…"
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 outline-none focus:border-[var(--accent)]"
          />
        </label>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-muted)]"
          >
            Save
          </button>
          <Link
            href="/"
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
