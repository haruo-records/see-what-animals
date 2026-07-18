/**
 * SEEDED RANDOM — the only source of randomness in the generator.
 *
 * Math.random() is never called anywhere under generator/. Reproducibility is
 * the whole contract: the same seed, generator version, rule-set version and
 * module versions must yield the same work months later on another machine.
 *
 * xmur3 for seeding + sfc32 for the stream. Both are small, well understood and
 * deterministic across platforms — no dependency, no BigInt, no float drift.
 */

function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

function sfc32(a: number, b: number, c: number, d: number): () => number {
  return () => {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    const t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    const r = (t + d) | 0;
    c = (c + r) | 0;
    return (r >>> 0) / 4294967296;
  };
}

export type Rng = {
  /** [0, 1) */
  next(): number;
  /** [min, max) as a float. */
  float(min: number, max: number): number;
  /** [min, max] as an integer, inclusive at both ends. */
  int(min: number, max: number): number;
  bool(probability?: number): boolean;
  pick<T>(items: readonly T[]): T;
  /** Weighted pick. Items whose weight is <= 0 are never chosen. */
  pickWeighted<T>(items: readonly T[], weightOf: (item: T) => number): T;
  /** A new array, shuffled. The input is not mutated. */
  shuffle<T>(items: readonly T[]): T[];
  /** Up to `count` distinct items, in random order. */
  sample<T>(items: readonly T[], count: number): T[];
  /**
   * A derived, independent stream. Use it for sub-decisions so that adding a
   * decision in one place does not shift every later value in the parent
   * stream — otherwise one new parameter silently rewrites the whole archive.
   */
  fork(label: string): Rng;
};

export function createRng(seed: string): Rng {
  const h = xmur3(seed);
  const next = sfc32(h(), h(), h(), h());

  const rng: Rng = {
    next,
    float: (min, max) => min + next() * (max - min),
    int: (min, max) => {
      if (max < min) throw new Error(`int(${min}, ${max}): max is below min`);
      return Math.floor(min + next() * (max - min + 1));
    },
    bool: (probability = 0.5) => next() < probability,
    pick: (items) => {
      if (items.length === 0) throw new Error("pick() called with an empty list");
      return items[Math.floor(next() * items.length)];
    },
    pickWeighted: (items, weightOf) => {
      const usable = items.filter((i) => weightOf(i) > 0);
      if (usable.length === 0) {
        throw new Error("pickWeighted() has no item with a positive weight");
      }
      const total = usable.reduce((sum, i) => sum + weightOf(i), 0);
      let threshold = next() * total;
      for (const item of usable) {
        threshold -= weightOf(item);
        if (threshold <= 0) return item;
      }
      return usable[usable.length - 1];
    },
    shuffle: (items) => {
      const copy = [...items];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
    sample: (items, count) => rng.shuffle(items).slice(0, Math.max(0, count)),
    fork: (label) => createRng(`${seed}::${label}`),
  };

  return rng;
}
