import type { PatternModule, SvgNode } from "../../registry/module-types";
import { r2 } from "../shared";

/** Parallel bands at an angle, with one interval left out. */
export const patternStripes: PatternModule = {
  id: "pattern-stripes-01",
  category: "pattern",
  version: 1,
  label: "stripes",
  enabled: true,
  tags: ["pattern", "repetition", "rigidity", "contrast"],
  parameters: {
    count: { type: "integer", min: 3, max: 18, default: 8 },
    angle: { type: "number", min: -70, max: 70, default: 22 },
    thickness: { type: "number", min: 2, max: 22, default: 7 },
    skipIndex: { type: "integer", min: -1, max: 17, default: 4 },
  },
  draw({ params, colors }, bounds) {
    const count = Number(params.count);
    const angle = Number(params.angle);
    const th = Number(params.thickness);
    const skip = Number(params.skipIndex);
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const half = Math.min(bounds.width, bounds.height) * 0.42;
    const pitch = (half * 2) / (count + 1);

    const nodes: SvgNode[] = [];
    for (let i = 0; i < count; i++) {
      if (i === skip) continue; // the missing interval
      const off = -half + pitch * (i + 1);
      nodes.push({
        tag: "path",
        attrs: {
          d: `M ${r2(cx - half)} ${r2(cy + off)} L ${r2(cx + half)} ${r2(cy + off)}`,
          fill: "none",
          stroke: colors.ink,
          "stroke-width": r2(th),
          "stroke-linecap": "round",
          transform: `rotate(${r2(angle)} ${r2(cx)} ${r2(cy)})`,
        },
      });
    }
    return nodes;
  },
};
