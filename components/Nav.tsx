import Link from "next/link";

const linkClass =
  "text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors";

export function Nav() {
  return (
    <nav className="mt-6 flex flex-wrap gap-6">
      <Link href="/" className={linkClass}>
        Library
      </Link>
      <Link href="/insights" className={linkClass}>
        Insights
      </Link>
      <Link href="/books/new" className={linkClass}>
        Add book
      </Link>
    </nav>
  );
}
