import type { Anchor, SvgNode } from "../registry/module-types";

/** Rounds to 2dp so SVG output is byte-identical across platforms. */
export const r2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * THE ONE DRAWING RULE of the redesigned form language:
 * every mass is solid ink with a white (paper-coloured) outline.
 *
 * On the white ground the outline is invisible, so a lone mass reads as a flat
 * black plane. Where two masses touch or overlap, the outline of the upper one
 * becomes a white seam separating them — which is exactly how the original
 * animals drawings articulate structure: not with interior detail, but with
 * white division lines between a few large planes.
 */
export const SEAM = 9;

export function mass(
  attrs: Record<string, string | number>,
  tag: SvgNode["tag"],
  ink: string,
  light: string,
): SvgNode {
  return {
    tag,
    attrs: {
      ...attrs,
      fill: ink,
      stroke: light,
      "stroke-width": SEAM,
      "stroke-linejoin": "round",
    },
  };
}

/**
 * A solid rounded slab — the basic unit of almost every body.
 *
 * `contour: true` adds a paper-coloured line INSIDE the mass, parallel to its
 * edge. In the source drawings this inner line is what gives a flat black
 * plane its sense of thickness — the silhouette stays flat, but the rim reads
 * as a surface turning away. It is drawn, not derived: an inset echo of the
 * outline, which is exactly how the originals do it.
 */
export function slab(
  cx: number,
  cy: number,
  w: number,
  h: number,
  ink: string,
  light: string,
  options: { rx?: number; rotate?: number; contour?: boolean } = {},
): SvgNode {
  const rx = options.rx ?? Math.min(w, h) * 0.46;
  const body = mass(
    { x: r2(cx - w / 2), y: r2(cy - h / 2), width: r2(w), height: r2(h), rx: r2(rx) },
    "rect",
    ink,
    light,
  );

  const children: SvgNode[] = [body];
  if (options.contour) {
    const inset = Math.min(w, h) * 0.14 + 6;
    children.push({
      tag: "rect",
      attrs: {
        x: r2(cx - w / 2 + inset),
        y: r2(cy - h / 2 + inset),
        width: r2(w - inset * 2),
        height: r2(h - inset * 2),
        rx: r2(Math.max(4, rx - inset)),
        fill: "none",
        stroke: light,
        "stroke-width": 7,
      },
    });
  }

  if (children.length === 1 && !options.rotate) return body;
  return {
    tag: "g",
    attrs: options.rotate
      ? { transform: `rotate(${r2(options.rotate)} ${r2(cx)} ${r2(cy)})` }
      : {},
    children,
  };
}

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
