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

import type { Form, Node } from "./types";
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

type Blob = { path: string; depth: number; tone: "a" | "b"; centre: Vec2; radius: number };

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
  const body: string[] = [];
  for (const b of blobs) {
    const base = colourOf(b.tone);
    const lift = b.radius * 0.2;
    body.push(`    <path d="${b.path}" fill="${base}"/>`);
    body.push(
      `    <g transform="translate(${r2(-lift * 0.72)} ${r2(-lift)}) scale(0.9)" transform-origin="${r2(b.centre[0])} ${r2(b.centre[1])}">` +
        `<path d="${b.path}" fill="${shade(base, 0.13)}"/></g>`,
    );
    body.push(
      `    <g transform="translate(${r2(-lift * 1.5)} ${r2(-lift * 2.1)}) scale(0.62)" transform-origin="${r2(b.centre[0])} ${r2(b.centre[1])}">` +
        `<path d="${b.path}" fill="${shade(base, 0.3)}"/></g>`,
    );
  }

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
