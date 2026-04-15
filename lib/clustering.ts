/**
 * Simple k-means on L2-normalized vectors (cosine distance via dot product).
 */

function l2Normalize(v: number[]): number[] {
  let s = 0;
  for (const x of v) s += x * x;
  const n = Math.sqrt(s) || 1;
  return v.map((x) => x / n);
}

function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

export function kMeansCosine(
  vectors: number[][],
  k: number,
  maxIter = 50,
): { assignments: number[]; centroids: number[][] } {
  const n = vectors.length;
  if (n === 0) {
    return { assignments: [], centroids: [] };
  }
  const dim = vectors[0].length;
  const normalized = vectors.map(l2Normalize);

  k = Math.max(1, Math.min(k, n));

  const centroids: number[][] = [];
  const used = new Set<number>();
  while (centroids.length < k) {
    const idx = randomInt(n);
    if (used.has(idx)) continue;
    used.add(idx);
    centroids.push([...normalized[idx]]);
  }

  const assignments = new Array<number>(n).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;
    for (let i = 0; i < n; i++) {
      let best = 0;
      let bestSim = -Infinity;
      for (let c = 0; c < k; c++) {
        const sim = dot(normalized[i], centroids[c]);
        if (sim > bestSim) {
          bestSim = sim;
          best = c;
        }
      }
      if (assignments[i] !== best) {
        assignments[i] = best;
        changed = true;
      }
    }

    const counts = new Array(k).fill(0);
    const sums: number[][] = Array.from({ length: k }, () =>
      new Array(dim).fill(0),
    );
    for (let i = 0; i < n; i++) {
      const c = assignments[i];
      counts[c]++;
      for (let d = 0; d < dim; d++) {
        sums[c][d] += normalized[i][d];
      }
    }
    for (let c = 0; c < k; c++) {
      if (counts[c] === 0) {
        centroids[c] = [...normalized[randomInt(n)]];
        continue;
      }
      const inv = 1 / counts[c];
      for (let d = 0; d < dim; d++) {
        centroids[c][d] = sums[c][d] * inv;
      }
      centroids[c] = l2Normalize(centroids[c]);
    }

    if (!changed) break;
  }

  return { assignments, centroids };
}

export function suggestK(nBooks: number): number {
  if (nBooks <= 2) return nBooks;
  const raw = Math.round(Math.sqrt(nBooks / 2));
  let k = Math.max(2, Math.min(raw, 8, nBooks));
  // With enough analyzed books, prefer finer groups (up to 4) instead of staying at 2.
  if (nBooks >= 8) {
    k = Math.max(k, Math.min(4, nBooks));
  } else if (nBooks >= 6) {
    k = Math.max(k, Math.min(3, nBooks));
  }
  return k;
}
