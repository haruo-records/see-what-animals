import type { PatternModule, SvgNode } from "../../registry/module-types";
import { crossLine } from "../../render/skeleton";

/**
 * Structure lines ACROSS the body, following the spine. Each line sits where
 * the body actually is and spans only as far as the body is thick there, so
 * the division reads as a joint rather than as a stripe painted on top.
 *
 * They are spaced unevenly — segments that bunch toward one end, the way a
 * thing that bends more in one place is divided more there.
 */
export const patternSegments: PatternModule = {
  id: "pattern-segments-01",
  category: "pattern",
  version: 1,
  label: "segments",
  enabled: true,
  tags: ["pattern", "repetition", "continuous"],
  parameters: {
    count: { type: "integer", min: 2, max: 7, default: 4 },
    from: { type: "number", min: 0.1, max: 0.4, default: 0.22 },
    to: { type: "number", min: 0.6, max: 0.95, default: 0.85 },
    bunch: { type: "number", min: 0.6, max: 2.2, default: 1.5 },
    width: { type: "number", min: 8, max: 14, default: 10 },
  },
  draw({ colors, params }, plan) {
    const count = Number(params.count);
    const from = Number(params.from);
    const to = Number(params.to);
    const bunch = Number(params.bunch);
    const spine = plan.spines[0];
    const nodes: SvgNode[] = [];
    for (let i = 0; i < count; i++) {
      const u = count === 1 ? 0.5 : i / (count - 1);
      const t = from + (to - from) * Math.pow(u, bunch);
      nodes.push(crossLine(spine, t, colors.light, { width: Number(params.width) }));
    }
    return nodes;
  },
};
