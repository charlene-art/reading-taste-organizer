import Link from "next/link";

type Props = {
  initial: { q: string; theme: string; tone: string; cluster: string };
  clusterNames: Record<string, string> | null;
  hasClusterRun: boolean;
};

export function LibraryFilters({
  initial,
  clusterNames,
  hasClusterRun,
}: Props) {
  const clusterOptions =
    clusterNames &&
    Object.entries(clusterNames).map(([k, label]) => ({
      value: k,
      label,
    }));

  return (
    <form
      method="get"
      action="/"
      className="mb-8 space-y-4"
    >
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          name="q"
          placeholder="Search title or author"
          defaultValue={initial.q}
          className="min-w-[200px] flex-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        />
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
          Theme contains
          <input
            type="text"
            name="theme"
            placeholder="e.g. grief"
            defaultValue={initial.theme}
            className="min-w-[140px] rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
          Tone contains
          <input
            type="text"
            name="tone"
            placeholder="e.g. bleak"
            defaultValue={initial.tone}
            className="min-w-[140px] rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />
        </label>
        {hasClusterRun && clusterOptions && clusterOptions.length > 0 ? (
          <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
            Cluster
            <select
              name="cluster"
              defaultValue={initial.cluster}
              className="min-w-[180px] rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            >
              <option value="">All clusters</option>
              {clusterOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <button
          type="submit"
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-muted)]"
        >
          Apply filters
        </button>
        <Link
          href="/"
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          Clear
        </Link>
      </div>
    </form>
  );
}
