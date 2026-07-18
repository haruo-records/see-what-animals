import type { Anchor, SvgNode } from "../registry/module-types";

/** Rounds to 2dp so SVG output is byte-identical across platforms. */
export const r2 = (n: number): number => Math.round(n * 100) / 100;

export function anchorsOnEllipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  count: number,
  startAngle = -Math.PI / 2,
): Anchor[] {
  const out: Anchor[] = [];
  for (let i = 0; i < count; i++) {
    const a = startAngle + (i / count) * Math.PI * 2;
    out.push({ x: r2(cx + Math.cos(a) * rx), y: r2(cy + Math.sin(a) * ry), angle: a });
  }
  return out;
}

export function strokePath(d: string, color: string, width: number, extra: Record<string, string | number> = {}): SvgNode {
  return {
    tag: "path",
    attrs: { d, fill: "none", stroke: color, "stroke-width": r2(width), "stroke-linecap": "round", ...extra },
  };
}

export function fillPath(d: string, color: string, extra: Record<string, string | number> = {}): SvgNode {
  return { tag: "path", attrs: { d, fill: color, ...extra } };
}
