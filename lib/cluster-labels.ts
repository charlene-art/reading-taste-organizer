export function labelClusterFromThemes(themeLists: string[][]): string {
  const counts = new Map<string, number>();
  for (const list of themeLists) {
    for (const t of list) {
      const key = t.trim();
      if (!key) continue;
      const norm = key.toLowerCase();
      counts.set(norm, (counts.get(norm) ?? 0) + 1);
    }
  }
  const top = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => {
      for (const list of themeLists) {
        for (const t of list) {
          if (t.trim().toLowerCase() === k) return t.trim();
        }
      }
      return k;
    });
  return top.join(" · ") || "Thematic group";
}
