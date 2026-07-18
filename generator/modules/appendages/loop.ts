import type { AppendageModule, SvgNode } from "../../registry/module-types";
import { r2 } from "../shared";

/** A closed curl that returns to where it started. It encloses nothing useful. */
export const appendageLoop: AppendageModule = {
  id: "appendage-loop-01",
  category: "appendage",
  version: 1,
  label: "loop",
  enabled: true,
  tags: ["shape", "continuous", "softness"],
  parameters: {
    radius: { type: "number", min: 22, max: 92, default: 48 },
    offset: { type: "number", min: 10, max: 120, default: 56 },
    thickness: { type: "number", min: 2, max: 10, default: 4 },
  },
  draw({ params, colors }, at, index) {
    const rad = Number(params.radius) * (index % 2 === 0 ? 1 : 0.76);
    const off = Number(params.offset);
    const cx = at.x + Math.cos(at.angle) * (off + rad);
    const cy = at.y + Math.sin(at.angle) * (off + rad);
    const nodes: SvgNode[] = [
      {
        tag: "path",
        attrs: {
          d: `M ${r2(at.x)} ${r2(at.y)} L ${r2(cx - Math.cos(at.angle) * rad)} ${r2(cy - Math.sin(at.angle) * rad)}`,
          fill: "none",
          stroke: colors.ink,
          "stroke-width": r2(Number(params.thickness)),
        },
      },
      {
        tag: "circle",
        attrs: {
          cx: r2(cx),
          cy: r2(cy),
          r: r2(rad),
          fill: "none",
          stroke: colors.ink,
          "stroke-width": r2(Number(params.thickness)),
        },
      },
    ];
    return nodes;
  },
};
