import type { PatternModule, SvgNode } from "../../registry/module-types";
import { resample, r2 } from "../../render/skeleton";

/**
 * A single line running ALONG the body, offset to one side of its centre. It
 * reads as an edge seen edge-on: the boundary between a face turned toward you
 * and one turned away, which is how a flat black plane acquires a far side.
 *
 * Offset, never centred — a centred line would halve the body and make it
 * symmetrical, which is the thing being avoided.
 */
export const patternSeam: PatternModule = {
  id: "pattern-seam-01",
  category: "pattern",
  version: 1,
  label: "seam",
  enabled: true,
  tags: ["layer", "continuous", "contrast"],
  parameters: {
    offset: { type: "number", min: 0.2, max: 0.62, default: 0.42 },
    from: { type: "number", min: 0.02, max: 0.3, default: 0.12 },
    to: { type: "number", min: 0.6, max: 0.98, default: 0.88 },
    side: { type: "boolean", default: true },
    width: { type: "number", min: 8, max: 13, default: 10 },
  },
  draw({ colors, params }, plan) {
    const s = resample(plan.spines[0], 8);
    if (s.length < 3) return [];
    const offset = Number(params.offset) * (Boolean(params.side) ? 1 : -1);
    const i0 = Math.floor(Number(params.from) * (s.length - 1));
    const i1 = Math.floor(Number(params.to) * (s.length - 1));

    const pts: string[] = [];
    for (let i = i0; i <= i1; i++) {
      const prev = s[Math.max(0, i - 1)];
      const next = s[Math.min(s.length - 1, i + 1)];
      const tx = next.x - prev.x;
      const ty = next.y - prev.y;
      const len = Math.hypot(tx, ty) || 1;
      // Perpendicular, scaled by the local thickness so it hugs the body.
      const nx = (-ty / len) * s[i].r * offset;
      const ny = (tx / len) * s[i].r * offset;
      pts.push(`${pts.length === 0 ? "M" : "L"} ${r2(s[i].x + nx)} ${r2(s[i].y + ny)}`);
    }
    if (pts.length < 2) return [];

    const nodes: SvgNode[] = [
      {
        tag: "path",
        attrs: {
          d: pts.join(" "),
          fill: "none",
          stroke: colors.light,
          "stroke-width": Number(params.width),
          "stroke-linecap": "round",
        },
      },
    ];
    return nodes;
  },
};
