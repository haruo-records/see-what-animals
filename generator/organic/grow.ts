import type { Node, Link } from "./types";

/**
 * GROWTH HELPERS.
 *
 * Every one of these produces a run of nodes and the links between them, so a
 * structure is described by how it grew rather than by where its pieces went.
 */

export type Part = { nodes: Node[]; links: Link[] };

export const merge = (...parts: Part[]): Part => ({
  nodes: parts.flatMap((p) => p.nodes),
  links: parts.flatMap((p) => p.links),
});

/** A run of nodes along a path, linked end to end. */
export function chain(
  id: string,
  points: Array<[number, number, number]>,
  radiusAt: (t: number) => number,
  tone?: "a" | "b",
): Part {
  const nodes: Node[] = points.map(([x, y, z], i) => ({
    id: `${id}-${i}`,
    x,
    y,
    z,
    r: radiusAt(points.length === 1 ? 0 : i / (points.length - 1)),
    tone,
  }));
  const links: Link[] = nodes.slice(1).map((n, i) => ({ a: nodes[i].id, b: n.id, tone }));
  return { nodes, links };
}

/** A closed run: the same as a chain, with the last node joined back to the first. */
export function loop(
  id: string,
  points: Array<[number, number, number]>,
  radiusAt: (t: number) => number,
  tone?: "a" | "b",
): Part {
  const part = chain(id, points, radiusAt, tone);
  part.links.push({ a: part.nodes[part.nodes.length - 1].id, b: part.nodes[0].id, tone });
  return part;
}

/** Points around a ring in a chosen plane. */
export function ringPoints(
  centre: [number, number, number],
  radius: number,
  count: number,
  plane: "xy" | "xz" | "yz" = "xy",
  startDeg = 0,
  wobble = 0,
): Array<[number, number, number]> {
  const out: Array<[number, number, number]> = [];
  for (let i = 0; i < count; i++) {
    const a = ((startDeg + (360 * i) / count) * Math.PI) / 180;
    const w = 1 + Math.sin(i * 2.1) * wobble;
    const u = Math.cos(a) * radius * w;
    const v = Math.sin(a) * radius * w;
    if (plane === "xy") out.push([centre[0] + u, centre[1] + v, centre[2]]);
    else if (plane === "xz") out.push([centre[0] + u, centre[1], centre[2] + v]);
    else out.push([centre[0], centre[1] + u, centre[2] + v]);
  }
  return out;
}

/** A spiral climbing as it turns. */
export function spiralPoints(
  centre: [number, number, number],
  fromRadius: number,
  toRadius: number,
  turns: number,
  rise: number,
  steps: number,
  startDeg = 0,
): Array<[number, number, number]> {
  const out: Array<[number, number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = ((startDeg + turns * 360 * t) * Math.PI) / 180;
    const r = fromRadius + (toRadius - fromRadius) * t;
    out.push([centre[0] + Math.cos(a) * r, centre[1] + Math.sin(a) * r, centre[2] + rise * t]);
  }
  return out;
}

/**
 * A branching growth: each limb divides into two, thinning as it goes, until
 * it runs out of generations. The thickening at the tips is what stops the ends
 * looking cut off.
 */
export function branch(
  id: string,
  from: [number, number, number],
  dir: [number, number, number],
  length: number,
  radius: number,
  generations: number,
  spread: number,
  options: { thinning?: number; tipSwell?: number; lean?: number } = {},
): Part {
  const thinning = options.thinning ?? 0.66;
  const tipSwell = options.tipSwell ?? 1.5;
  const lean = options.lean ?? 0;
  const nodes: Node[] = [];
  const links: Link[] = [];
  let counter = 0;

  const norm = (v: [number, number, number]): [number, number, number] => {
    const l = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  };

  const grow = (
    start: [number, number, number],
    d: [number, number, number],
    len: number,
    rad: number,
    gen: number,
    parentId: string | null,
  ) => {
    const u = norm(d);
    const end: [number, number, number] = [
      start[0] + u[0] * len,
      start[1] + u[1] * len,
      start[2] + u[2] * len,
    ];
    const last = gen === 0;
    const nid = `${id}-${counter++}`;
    nodes.push({ id: nid, x: end[0], y: end[1], z: end[2], r: last ? rad * tipSwell : rad });
    if (parentId) links.push({ a: parentId, b: nid });
    if (last) return;

    // Two children, turned away from each other about the vertical, and given
    // slightly different lengths so the tree never comes out symmetrical.
    for (const side of [-1, 1]) {
      const a = spread * side + lean;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      const nd: [number, number, number] = [u[0] * cos - u[1] * sin, u[0] * sin + u[1] * cos, u[2] + 0.32 * side];
      grow(end, nd, len * (side < 0 ? 0.82 : 0.7), rad * thinning, gen - 1, nid);
    }
  };

  const rootId = `${id}-root`;
  nodes.push({ id: rootId, x: from[0], y: from[1], z: from[2], r: radius });
  grow(from, dir, length, radius, generations, rootId);
  return { nodes, links };
}
