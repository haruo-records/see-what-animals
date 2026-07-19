import type { Vec } from "./types";

/**
 * MASS BY DEFORMATION.
 *
 * Everything before this started from a circle. `lobe` was radii around a
 * centre; the arcs and spirals were circles too. A vocabulary of deformed
 * circles produces rings, crescents, doughnuts and circular bites no matter
 * what is done to it, because those ARE circles with something done to them.
 *
 * Here a mass begins as something with a LENGTH and TWO INDEPENDENT SURFACES.
 * A stalk is a path with an upper profile and a lower profile that know nothing
 * about each other, so the form is asymmetric about its own axis from the
 * outset rather than by being spoiled afterwards. There is no centre and no
 * radius, so there is nothing for a circle to emerge from.
 *
 * Form then comes from things happening to that mass: it swells somewhere, it
 * is pressed flat somewhere else, it bends, it thickens where it takes weight.
 * Those are the operations below, and they are the whole vocabulary.
 *
 * Ends are BLUNT. A profile that runs to zero makes a point, and a point reads
 * as a tooth, a claw or a spine — as something that means the viewer harm. A
 * mass that has stopped growing has an end, not a tip.
 */

/**
 * The least width an end may have.
 *
 * Raised for the palm-sized bodies. At 30cm a narrow end reads as a taper; at
 * 6cm the same proportion reads as a point, and a point on something small
 * enough to hold is the one thing that would stop you picking it up.
 */
const BLUNT = 26;

export type Profile = (t: number) => number;

/** A constant surface, as a starting point to be deformed. */
export const flat = (w: number): Profile => () => w;

/** Thicker in the middle, in a way that is not a circle's way. */
export const swell =
  (base: number, extra: number, at = 0.5, spread = 0.55): Profile =>
  (t) => {
    const d = Math.abs(t - at) / spread;
    return base + extra * Math.max(0, 1 - d * d);
  };

/** Steadily heavier toward one end. Growth that kept going. */
export const grows =
  (from: number, to: number, curve = 1): Profile =>
  (t) => from + (to - from) * Math.pow(t, curve);

/** A local flattening, as though something rested here for a long time. */
export const pressed =
  (base: Profile, at: number, depth: number, width = 0.18): Profile =>
  (t) => {
    const d = Math.abs(t - at);
    if (d > width) return base(t);
    const bite = depth * (0.5 + 0.5 * Math.cos((d / width) * Math.PI));
    return Math.max(BLUNT * 0.5, base(t) * (1 - bite));
  };

/** Two profiles blended along the length: a mass that changes character partway. */
export const becomes =
  (a: Profile, b: Profile, at = 0.5, over = 0.3): Profile =>
  (t) => {
    const k = Math.min(1, Math.max(0, (t - (at - over / 2)) / over));
    const ease = k * k * (3 - 2 * k);
    return a(t) * (1 - ease) + b(t) * ease;
  };

/**
 * Closes a path and its two surfaces into one outline.
 *
 * The two profiles are applied to opposite sides, so `upper` and `lower` are
 * genuinely different surfaces of one body rather than a thickness mirrored
 * about a centreline.
 */
export function stalk(path: Vec[], upper: Profile, lower: Profile): Vec[] {
  const n = path.length;
  const top: Vec[] = [];
  const bottom: Vec[] = [];

  for (let i = 0; i < n; i++) {
    const prev = path[Math.max(0, i - 1)];
    const next = path[Math.min(n - 1, i + 1)];
    const tx = next[0] - prev[0];
    const ty = next[1] - prev[1];
    const l = Math.hypot(tx, ty) || 1;
    const nx = -ty / l;
    const ny = tx / l;
    const t = n === 1 ? 0 : i / (n - 1);
    top.push([path[i][0] + nx * Math.max(BLUNT * 0.4, upper(t)), path[i][1] + ny * Math.max(BLUNT * 0.4, upper(t))]);
    bottom.push([path[i][0] - nx * Math.max(BLUNT * 0.4, lower(t)), path[i][1] - ny * Math.max(BLUNT * 0.4, lower(t))]);
  }

  // Blunt ends: one point set slightly beyond each end, so the two surfaces
  // meet across a short face instead of closing to a point.
  const endFace = (a: Vec, b: Vec, from: Vec, awayFrom: Vec): Vec[] => {
    const dx = from[0] - awayFrom[0];
    const dy = from[1] - awayFrom[1];
    const l = Math.hypot(dx, dy) || 1;
    const reach = Math.max(BLUNT, Math.hypot(a[0] - b[0], a[1] - b[1]) * 0.32);
    const mid: Vec = [from[0] + (dx / l) * reach, from[1] + (dy / l) * reach];
    return [
      [(a[0] + mid[0]) / 2, (a[1] + mid[1]) / 2],
      mid,
      [(b[0] + mid[0]) / 2, (b[1] + mid[1]) / 2],
    ];
  };

  return [
    ...top,
    ...endFace(top[n - 1], bottom[n - 1], path[n - 1], path[Math.max(0, n - 2)]),
    ...bottom.slice().reverse(),
    ...endFace(bottom[0], top[0], path[0], path[Math.min(n - 1, 1)]),
  ];
}

/**
 * A path that bends once, from a start point and two headings. Bending is a
 * thing that happened to a length, which is why it is expressed as a change of
 * heading partway rather than as an arc of some radius.
 */
/**
 * A BREAK.
 *
 * Replaces a stretch of outline with a nearly straight chord — the flat that
 * appears where something was chipped, snapped, or ground away against
 * whatever it spent a long time lying on.
 *
 * This is the strongest thing available against roundness. A curve made less
 * curved is still a curve; a chord is a different kind of edge entirely, and
 * it is the edge a potsherd, a struck flint or a broken casting has. It also
 * carries time, which no amount of smooth contour can: something is missing
 * from here, and it left in one event rather than gradually.
 *
 * The chord is given a slight waver so it does not read as a cut.
 */
export function chip(points: Vec[], at: number, span: number, bow = 0.06): Vec[] {
  const n = points.length;
  const start = Math.floor(at * n);
  const count = Math.max(2, Math.round(span * n));
  const a = points[start % n];
  const b = points[(start + count) % n];

  const replaced: Vec[] = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    // Very slightly hollow, the way a broken face usually is.
    const dip = Math.sin(t * Math.PI) * bow;
    const nx = -(b[1] - a[1]);
    const ny = b[0] - a[0];
    replaced.push([
      a[0] + (b[0] - a[0]) * t + nx * dip,
      a[1] + (b[1] - a[1]) * t + ny * dip,
    ]);
  }

  // Keep everything from the far end of the break round to its near end, and
  // drop what the break removed. Retaining those points as well — which an
  // earlier version of this did — leaves the outline crossing itself: the
  // chord and the material it was supposed to replace both present. A
  // self-intersecting outline fills unpredictably and defeats any point-in-
  // polygon test run against it, so the break silently broke the occlusion
  // report too.
  const out: Vec[] = [...replaced];
  for (let i = 1; i < n - count; i++) {
    out.push(points[(start + count + i) % n]);
  }
  return out;
}

/**
 * A SLOT — an opening that is not a hole.
 *
 * A round opening reads as a bore, a port, a drilled thing, and a body with
 * several reads as a colander. A long narrow opening with unequal ends reads as
 * a gap that something passes through, and does not suggest a drill at all.
 */
export function slot(from: Vec, to: Vec, halfWidth: number, taper = 0.45): Vec[] {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l;
  const ny = dx / l;
  const w0 = halfWidth;
  const w1 = halfWidth * taper;
  const mid: Vec = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
  return [
    [from[0] + nx * w0, from[1] + ny * w0],
    [mid[0] + nx * w0 * 0.92, mid[1] + ny * w0 * 0.92],
    [to[0] + nx * w1, to[1] + ny * w1],
    [to[0] - nx * w1, to[1] - ny * w1],
    [mid[0] - nx * w0 * 0.86, mid[1] - ny * w0 * 0.86],
    [from[0] - nx * w0, from[1] - ny * w0],
  ];
}

/**
 * SAG — mass pulled down by its own weight, most where it is least supported.
 * A form that sags has been somewhere, under gravity, for a long time.
 */
export function sag(points: Vec[], amount: number, from: number, to: number): Vec[] {
  const xs = points.map((p) => p[0]);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const span = x1 - x0 || 1;
  return points.map(([x, y]) => {
    const t = (x - x0) / span;
    if (t < from || t > to) return [x, y] as Vec;
    const k = (t - from) / (to - from);
    return [x, y + amount * Math.sin(k * Math.PI)] as Vec;
  });
}

/**
 * A SHORT SUPPORTING NUB — not a leg.
 *
 * The difference is proportion, and at this scale proportion is everything. A
 * support that is long relative to the body makes a creature standing on legs;
 * a support barely longer than it is wide makes a body resting on a couple of
 * bumps, which is what a small thing that has been sitting somewhere for a
 * long time actually looks like.
 */
export function nub(from: Vec, headingDeg: number, length: number, width: number): Vec[] {
  return stalk(
    leaning(from, headingDeg, headingDeg > 0 ? -8 : 8, length, 4),
    becomes(flat(width), swell(width * 0.84, width * 0.3, 0.85, 0.3), 0.5, 0.5),
    becomes(flat(width * 0.92), swell(width * 0.78, width * 0.26, 0.85, 0.3), 0.5, 0.5),
  );
}

export function bent(
  from: Vec,
  headingDeg: number,
  turnDeg: number,
  length: number,
  turnAt = 0.5,
  steps = 12,
): Vec[] {
  const out: Vec[] = [from];
  let x = from[0];
  let y = from[1];
  const step = length / steps;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    // The turn is spent over a short stretch, so the bend has a place.
    const spread = 0.26;
    const k = Math.min(1, Math.max(0, (t - (turnAt - spread / 2)) / spread));
    const ease = k * k * (3 - 2 * k);
    const a = ((headingDeg + turnDeg * ease) * Math.PI) / 180;
    x += Math.cos(a) * step;
    y += Math.sin(a) * step;
    out.push([x, y]);
  }
  return out;
}

/** A path that leans steadily, for a body that grew against something. */
export function leaning(from: Vec, headingDeg: number, driftDeg: number, length: number, steps = 10): Vec[] {
  return bent(from, headingDeg, driftDeg, length, 0.5, steps);
}

/**
 * A spiral centreline. Kept, because a spiral is a real order in living things
 * and the brief asks for one — but what is grown along it is a stalk with two
 * independent surfaces, so the result is a coil of a body rather than a ring.
 */
export function coiling(
  from: Vec,
  headingDeg: number,
  length: number,
  turnPerStep: number,
  tighten = 1,
  steps = 20,
): Vec[] {
  const out: Vec[] = [from];
  let x = from[0];
  let y = from[1];
  let h = headingDeg;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const step = (length / steps) * (1 - 0.45 * t);
    h += turnPerStep * (1 + tighten * t);
    const a = (h * Math.PI) / 180;
    x += Math.cos(a) * step;
    y += Math.sin(a) * step;
    out.push([x, y]);
  }
  return out;
}
