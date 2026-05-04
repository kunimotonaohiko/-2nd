function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s　]+/g, ' ')
    .replace(/[、。,.!?！？「」『』()（）\[\]【】・:：;；]/g, ' ')
    .trim();
}

function bigrams(text: string): Set<string> {
  const t = normalize(text).replace(/\s+/g, '');
  const grams = new Set<string>();
  for (let i = 0; i < t.length - 1; i++) {
    grams.add(t.slice(i, i + 2));
  }
  return grams;
}

function tokens(text: string): Set<string> {
  return new Set(
    normalize(text)
      .split(/\s+/)
      .filter((t) => t.length > 1),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

export function similarity(a: string, b: string): number {
  const bigramScore = jaccard(bigrams(a), bigrams(b));
  const tokenScore = jaccard(tokens(a), tokens(b));
  return bigramScore * 0.7 + tokenScore * 0.3;
}

export interface SimilarCandidate {
  id: number;
  name: string;
  purpose: string;
  start_time?: string;
}

export function findSimilar<T extends SimilarCandidate>(
  target: { name: string; purpose: string },
  candidates: T[],
  threshold = 0.2,
  topN = 5,
): Array<T & { score: number }> {
  const targetText = `${target.name} ${target.purpose}`;
  return candidates
    .map((c) => ({
      ...c,
      score: similarity(targetText, `${c.name} ${c.purpose}`),
    }))
    .filter((c) => c.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
