import type { PatternModule, SvgNode } from "../../registry/module-types";
import { r2 } from "../shared";

/**
 * Points spread across the interior. What registers is the density and the
 * spacing, not the individual marks.
 */
export const patternDots: PatternModule = {
  id: "pattern-dots-01",
  category: "pattern",
  version: 1,
  label: "dots",
  enabled: true,
  tags: ["pattern", "density", "repetition"],
  parameters: {
    count: { type: "integer", min: 4, max: 40, default: 16 },
    radius: { type: "number", min: 3, max: 20, default: 8 },
    coverage: { type: "number", min: 0.2, max: 0.46, default: 0.34 },
  },
  draw({ params, colors }, bounds) {
    const count = Number(params.count);
    const radius = Number(params.radius);
    const coverage = Number(params.coverage);
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const reach = Math.min(bounds.width, bounds.height) * coverage;
    const golden = Math.PI * (3 - Math.sqrt(5));

    const nodes: SvgNode[] = [];
    for (let i = 0; i < count; i++) {
      const rad = reach * Math.sqrt((i + 0.5) / count);
      const a = i * golden;
      nodes.push({
        tag: "circle",
        attrs: {
          cx: r2(cx + Math.cos(a) * rad),
          cy: r2(cy + Math.sin(a) * rad * 0.88),
          // One dot in five is noticeably smaller, so the field is never uniform.
          r: r2(i % 5 === 2 ? radius * 0.45 : radius),
          fill: colors.ink,
        },
      });
    }
    return nodes;
  },
};
