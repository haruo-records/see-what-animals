/**
 * SMOOTH ORGANIC FORMS IN ISOMETRIC.
 *
 * The block work was scaffolding. Blocks are a good way to decide where mass
 * goes and how a thing balances, and a bad way to finish: a stack of cuboids
 * always reads as a stack of cuboids, however small they are made. Everything
 * that made those models legible as construction — the steps, the seams, the
 * repeated modules — is exactly what has to disappear here.
 *
 * So the drawing primitive is not a solid any more. A form is a graph: nodes
 * with a radius, joined by links. Each node projects to a disc and each link to
 * the smooth hull between two discs, and because everything is filled in the
 * same colour with no outline anywhere, overlapping parts simply become one
 * body. There are no joints to hide because nothing is joined — the mass is
 * continuous by construction.
 *
 * Volume comes from three passes rather than from faces. The full silhouette,
 * then a smaller copy lifted up and to the left, then a smaller one again:
 * a rounded highlight that follows the form wherever it goes. That reads as a
 * turned surface rather than as a lit polyhedron, which is what these need.
 */

import type { Form, Node, Slab } from "./types";
import { SCHEMES, shade } from "./palette";

const COS30 = Math.cos(Math.PI / 6);
const SIN30 = 0.5;

export type Vec2 = [number, number];

export function project(x: number, y: number, z: number, unit: number): Vec2 {
  return [(x - y) * COS30 * unit, (x + y) * SIN30 * unit - z * unit];
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * The smooth hull of two discs: outer tangents down each side, capped by the
 * arcs of the discs themselves. This is the shape a soft tube takes between two
 * thicknesses, and it handles unequal radii without a seam at the join.
 */
function hullPath(p1: Vec2, r1: number, p2: Vec2, r2v: number): string {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const d = Math.hypot(dx, dy);

  // One disc swallowing the other leaves nothing to draw but the larger.
  if (d <= Math.abs(r1 - r2v) + 0.01) {
    const [c, r] = r1 >= r2v ? [p1, r1] : [p2, r2v];
    return `M ${r2(c[0] - r)} ${r2(c[1])} a ${r2(r)} ${r2(r)} 0 1 0 ${r2(r * 2)} 0 a ${r2(r)} ${r2(r)} 0 1 0 ${r2(-r * 2)} 0 Z`;
  }

  const theta = Math.atan2(dy, dx);
  const alpha = Math.acos(Math.max(-1, Math.min(1, (r1 - r2v) / d)));

  const a1: Vec2 = [p1[0] + r1 * Math.cos(theta + alpha), p1[1] + r1 * Math.sin(theta + alpha)];
  const a2: Vec2 = [p2[0] + r2v * Math.cos(theta + alpha), p2[1] + r2v * Math.sin(theta + alpha)];
  const b2: Vec2 = [p2[0] + r2v * Math.cos(theta - alpha), p2[1] + r2v * Math.sin(theta - alpha)];
  const b1: Vec2 = [p1[0] + r1 * Math.cos(theta - alpha), p1[1] + r1 * Math.sin(theta - alpha)];

  return [
    `M ${r2(a1[0])} ${r2(a1[1])}`,
    `L ${r2(a2[0])} ${r2(a2[1])}`,
    `A ${r2(r2v)} ${r2(r2v)} 0 0 0 ${r2(b2[0])} ${r2(b2[1])}`,
    `L ${r2(b1[0])} ${r2(b1[1])}`,
    `A ${r2(r1)} ${r2(r1)} 0 0 0 ${r2(a1[0])} ${r2(a1[1])}`,
    "Z",
  ].join(" ");
}

/**
 * A closed path through a polygon with every corner rounded by the same amount.
 * Taking the edges off is what stops a built member reading as a block: the
 * corner is where a moulding shows and where a snapped-together toy shows.
 */
function roundedPolygon(points: Vec2[], radius: number): string {
  const n = points.length;
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const here = points[i];
    const next = points[(i + 1) % n];
    const toPrev: Vec2 = [prev[0] - here[0], prev[1] - here[1]];
    const toNext: Vec2 = [next[0] - here[0], next[1] - here[1]];
    const lp = Math.hypot(...toPrev) || 1;
    const ln = Math.hypot(...toNext) || 1;
    const r = Math.min(radius, lp * 0.45, ln * 0.45);
    const a: Vec2 = [here[0] + (toPrev[0] / lp) * r, here[1] + (toPrev[1] / lp) * r];
    const b: Vec2 = [here[0] + (toNext[0] / ln) * r, here[1] + (toNext[1] / ln) * r];
    out.push(`${out.length === 0 ? "M" : "L"} ${r2(a[0])} ${r2(a[1])}`);
    out.push(`Q ${r2(here[0])} ${r2(here[1])} ${r2(b[0])} ${r2(b[1])}`);
  }
  return out.join(" ") + " Z";
}

/** The convex hull of a set of points, for a solid's outer silhouette. */
function hull(points: Vec2[]): Vec2[] {
  const pts = [...points].sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const cross = (o: Vec2, a: Vec2, b: Vec2) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const build = (src: Vec2[]) => {
    const out: Vec2[] = [];
    for (const p of src) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], p) <= 0) out.pop();
      out.push(p);
    }
    return out;
  };
  const lower = build(pts);
  const upper = build([...pts].reverse());
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

type Blob = { path: string; depth: number; tone: "a" | "b"; centre: Vec2; radius: number };

/**
 * A slab, as three tone-separated faces inside one rounded silhouette.
 *
 * The silhouette is drawn first and the faces laid inside it, so the member has
 * one continuous outer edge rather than three panels meeting at a seam. Face
 * separation is by tone alone — no lines, no gradients across an edge — which
 * is the flat, illustrated read the brief asks for rather than a rendering.
 */
function slabMarkup(sl: Slab, unit: number, base: string): { markup: string; depth: number } {
  const { x, y, z, w, d, h } = sl;
  const P = (a: number, b: number, c: number) => project(a, b, c, unit);
  const corners: Vec2[] = [];
  for (const [dx, dy, dz] of [
    [0, 0, 0], [w, 0, 0], [0, d, 0], [w, d, 0],
    [0, 0, h], [w, 0, h], [0, d, h], [w, d, h],
  ]) corners.push(P(x + dx, y + dy, z + dz));

  const soft = (sl.round ?? 0.16) * unit;
  const top: Vec2[] = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)];
  const right: Vec2[] = [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)];
  const left: Vec2[] = [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)];

  const markup = [
    `    <path d="${roundedPolygon(hull(corners), soft)}" fill="${shade(base, -0.06)}"/>`,
    `    <path d="${roundedPolygon(left, soft * 0.8)}" fill="${shade(base, 0.02)}"/>`,
    `    <path d="${roundedPolygon(right, soft * 0.8)}" fill="${shade(base, -0.16)}"/>`,
    `    <path d="${roundedPolygon(top, soft * 0.8)}" fill="${shade(base, 0.2)}"/>`,
  ].join("\n");

  return { markup, depth: x + w / 2 + (y + d / 2) + (z + h / 2) };
}

export type RenderOptions = { size?: number; margin?: number };

export function renderForm(form: Form, options: RenderOptions = {}): string {
  const size = options.size ?? 1024;
  const margin = options.margin ?? 0.09;
  const scheme = SCHEMES[form.scheme] ?? SCHEMES.teal;

  const byId = new Map<string, Node>();
  for (const n of form.nodes) byId.set(n.id, n);

  // Fit at unit 1, then scale. Nothing is positioned in screen space by hand.
  const probe: Vec2[] = [];
  for (const n of form.nodes) {
    const [px, py] = project(n.x, n.y, n.z, 1);
    probe.push([px - n.r, py - n.r], [px + n.r, py + n.r]);
  }
  for (const sl of form.slabs ?? []) {
    for (const [dx, dy, dz] of [
      [0, 0, 0], [sl.w, 0, 0], [0, sl.d, 0], [sl.w, sl.d, 0],
      [0, 0, sl.h], [sl.w, 0, sl.h], [0, sl.d, sl.h], [sl.w, sl.d, sl.h],
    ]) probe.push(project(sl.x + dx, sl.y + dy, sl.z + dz, 1));
  }
  const xs = probe.map((v) => v[0]);
  const ys = probe.map((v) => v[1]);
  const spanX = Math.max(...xs) - Math.min(...xs);
  const spanY = Math.max(...ys) - Math.min(...ys);
  const unit = (size * (1 - margin * 2)) / Math.max(spanX, spanY, 0.001);
  const cx = ((Math.min(...xs) + Math.max(...xs)) / 2) * unit;
  const cy = ((Math.min(...ys) + Math.max(...ys)) / 2) * unit;

  const blobs: Blob[] = [];

  for (const n of form.nodes) {
    const p = project(n.x, n.y, n.z, unit);
    const r = n.r * unit;
    blobs.push({
      path: `M ${r2(p[0] - r)} ${r2(p[1])} a ${r2(r)} ${r2(r)} 0 1 0 ${r2(r * 2)} 0 a ${r2(r)} ${r2(r)} 0 1 0 ${r2(-r * 2)} 0 Z`,
      depth: n.x + n.y + n.z,
      tone: n.tone ?? "a",
      centre: p,
      radius: r,
    });
  }

  for (const link of form.links) {
    const A = byId.get(link.a);
    const B = byId.get(link.b);
    if (!A || !B) continue;
    const pa = project(A.x, A.y, A.z, unit);
    const pb = project(B.x, B.y, B.z, unit);
    const ra = (link.ra ?? A.r) * unit;
    const rb = (link.rb ?? B.r) * unit;
    blobs.push({
      path: hullPath(pa, ra, pb, rb),
      depth: (A.x + A.y + A.z + (B.x + B.y + B.z)) / 2,
      tone: link.tone ?? A.tone ?? "a",
      centre: [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2],
      radius: (ra + rb) / 2,
    });
  }

  blobs.sort((p, q) => p.depth - q.depth);

  const colourOf = (tone: "a" | "b") => (tone === "a" ? scheme.a : scheme.b);

  /**
   * Three passes per blob, drawn together so a part is fully modelled before
   * the next one is laid over it. Doing all the silhouettes first and all the
   * highlights afterwards would let a highlight float over a part in front.
   */
  /**
   * Two passes, not three, and gentler than before.
   *
   * Three stacked highlights was starting to look rendered — the point is to
   * let a form be read as solid, not to explain its surface. One soft lift is
   * enough for that, and leaves the drawing flat enough to sit on a mug.
   */
  const drawn: Array<{ markup: string; depth: number }> = [];

  for (const b of blobs) {
    const base = colourOf(b.tone);
    const lift = b.radius * 0.17;
    drawn.push({
      depth: b.depth,
      markup: [
        `    <path d="${b.path}" fill="${base}"/>`,
        `    <g transform="translate(${r2(-lift * 0.75)} ${r2(-lift)}) scale(0.87)" transform-origin="${r2(b.centre[0])} ${r2(b.centre[1])}">` +
          `<path d="${b.path}" fill="${shade(base, 0.17)}"/></g>`,
      ].join("\n"),
    });
  }

  for (const sl of form.slabs ?? []) {
    drawn.push(slabMarkup(sl, unit, colourOf(sl.tone ?? "a")));
  }

  drawn.sort((p, q) => p.depth - q.depth);
  const body = drawn.map((d) => d.markup);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img">`,
    `  <rect width="${size}" height="${size}" fill="#FFFFFF"/>`,
    `  <g transform="translate(${r2(size / 2 - cx)} ${r2(size / 2 - cy)})">`,
    body.join("\n"),
    `  </g>`,
    `</svg>`,
    "",
  ].join("\n");
}
