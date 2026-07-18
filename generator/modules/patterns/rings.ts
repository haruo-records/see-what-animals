import type { PatternModule, SvgNode } from "../../registry/module-types";
import { r2 } from "../shared";

/** Concentric outlines. Each one is off-centre from the last by a little. */
export const patternRings: PatternModule = {
  id: "pattern-rings-01",
  category: "pattern",
  version: 1,
  label: "rings",
  enabled: true,
  tags: ["pattern", "repetition", "layer"],
  parameters: {
    count: { type: "integer", min: 2, max: 9, default: 4 },
    drift: { type: "number", min: 0, max: 26, default: 11 },
    thickness: { type: "number", min: 1.5, max: 8, default: 3 },
  },
  draw({ params, colors }, bounds) {
    const count = Number(params.count);
    const drift = Number(params.drift);
    const th = Number(params.thickness);
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const maxR = Math.min(bounds.width, bounds.height) * 0.4;

    const nodes: SvgNode[] = [];
    for (let i = 1; i <= count; i++) {
      const t = i / count;
      nodes.push({
        tag: "ellipse",
        attrs: {
          // Drift accumulates, so the rings lean out of true toward the edge.
          cx: r2(cx + drift * t * 1.3),
          cy: r2(cy - drift * t * 0.6),
          rx: r2(maxR * t),
          ry: r2(maxR * t * 0.84),
          fill: "none",
          stroke: colors.ink,
          "stroke-width": r2(th),
        },
      });
    }
    return nodes;
  },
};
