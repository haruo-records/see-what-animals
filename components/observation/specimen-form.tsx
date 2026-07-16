/**
 * SpecimenForm — a quiet, deterministic abstract form drawn in SVG.
 *
 * The brief forbids stock photos and AI-looking abstract backgrounds, and asks
 * that irregular shapes belong to the animals themselves. Until real work images
 * are placed under /public/specimens, this draws a calm Noguchi-adjacent organic
 * form from a string seed so every session looks distinct but never noisy.
 *
 * Colour is drawn from the foundation/accent tokens only. No gradients-for-luxury.
 */

// Small, stable string hash → seeded PRNG (mulberry32). Same seed → same form.
function seededRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A closed organic path from N radial points, smoothed with quadratic midpoints.
function organicPath(rand: () => number, cx: number, cy: number, radius: number): string {
  const points = 7 + Math.floor(rand() * 3);
  const pts: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const r = radius * (0.72 + rand() * 0.4);
    pts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r * 0.92]);
  }
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length; i++) {
    const cur = pts[i];
    const next = pts[(i + 1) % pts.length];
    const mx = (cur[0] + next[0]) / 2;
    const my = (cur[1] + next[1]) / 2;
    d += ` Q ${cur[0].toFixed(1)} ${cur[1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  return d + " Z";
}

const ACCENTS = [
  "var(--color-moss)",
  "var(--color-water)",
  "var(--color-clay)",
  "var(--color-dusk)",
];

export function SpecimenForm({
  seed,
  className,
}: {
  seed: string;
  className?: string;
}) {
  const rand = seededRandom(seed);
  const accent = ACCENTS[Math.floor(rand() * ACCENTS.length)];
  const cx = 100;
  const cy = 100;

  const body = organicPath(rand, cx, cy, 52);
  const satellites = Array.from({ length: 2 + Math.floor(rand() * 2) }, () => {
    const angle = rand() * Math.PI * 2;
    const dist = 40 + rand() * 34;
    return {
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist * 0.9,
      r: 6 + rand() * 12,
    };
  });

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      {/* stone plate the form rests on */}
      <ellipse cx={cx} cy={cy + 58} rx={70} ry={9} fill="var(--color-stone)" opacity={0.35} />
      {satellites.map((s, i) => (
        <circle
          key={i}
          cx={s.x.toFixed(1)}
          cy={s.y.toFixed(1)}
          r={s.r.toFixed(1)}
          fill={i % 2 === 0 ? accent : "var(--color-charcoal)"}
          opacity={i % 2 === 0 ? 0.9 : 0.82}
        />
      ))}
      <path d={body} fill="var(--color-charcoal)" />
      {/* a single quiet highlight — the "found" detail */}
      <circle cx={cx - 14} cy={cy - 16} r={7} fill={accent} />
    </svg>
  );
}
