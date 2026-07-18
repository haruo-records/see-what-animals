import type { PatternModule, SvgNode } from "../../registry/module-types";
import { r2 } from "../shared";

/**
 * A run of short marks at a steady pitch, with one place where the rhythm
 * slips. The disturbance is a single interval, not a general looseness.
 */
export const patternRepeatedLines: PatternModule = {
  id: "pattern-repeated-lines-01",
  category: "pattern",
  version: 1,
  label: "repeated-lines",
  enabled: true,
  tags: ["pattern", "repetition", "spacing", "fragmented"],
  parameters: {
    count: { type: "integer", min: 5, max: 30, default: 14 },
    length: { type: "number", min: 14, max: 90, default: 40 },
    thickness: { type: "number", min: 1.5, max: 7, default: 3 },
    disturbanceAt: { type: "number", min: 0, max: 1, default: 0.62 },
  },
  draw({ params, colors }, bounds) {
    const count = Number(params.count);
    const len = Number(params.length);
    const th = Number(params.thickness);
    const disturb = Number(params.disturbanceAt);
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const radius = Math.min(bounds.width, bounds.height) * 0.36;
    const slipIndex = Math.floor(disturb * count);

    const nodes: SvgNode[] = [];
    for (let i = 0; i < count; i++) {
      // One index onward, everything is out of phase by a third of a step.
      const phase = i >= slipIndex ? 0.34 : 0;
      const a = ((i + phase) / count) * Math.PI * 2 - Math.PI / 2;
      const x0 = cx + Math.cos(a) * radius;
      const y0 = cy + Math.sin(a) * radius;
      nodes.push({
        tag: "path",
        attrs: {
          d: `M ${r2(x0)} ${r2(y0)} L ${r2(x0 + Math.cos(a) * len)} ${r2(y0 + Math.sin(a) * len)}`,
          fill: "none",
          stroke: colors.ink,
          "stroke-width": r2(th),
          "stroke-linecap": "round",
        },
      });
    }
    return nodes;
  },
};
