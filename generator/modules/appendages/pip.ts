import type { AppendageModule, SvgNode } from "../../registry/module-types";
import { r2, SEAM } from "../shared";

/**
 * A small solid dot sitting on or just off the form — a rivet, a button, a
 * setting for a stone that was never set.
 */
export const auxPip: AppendageModule = {
  id: "appendage-pip-01",
  category: "appendage",
  version: 2,
  label: "pip",
  enabled: true,
  tags: ["shape", "repetition", "spacing"],
  parameters: {
    radius: { type: "number", min: 9, max: 20, default: 14 },
    standoff: { type: "number", min: 0, max: 40, default: 12 },
  },
  draw({ params, colors }, at, index) {
    const r = Number(params.radius);
    // Every third pip drifts clear of the surface.
    const off = Number(params.standoff) * (index % 3 === 2 ? 2.2 : 1);
    const nodes: SvgNode[] = [
      {
        tag: "circle",
        attrs: {
          cx: r2(at.x + Math.cos(at.angle) * off),
          cy: r2(at.y + Math.sin(at.angle) * off),
          r: r2(r),
          fill: colors.ink,
          stroke: colors.light,
          "stroke-width": SEAM * 0.7,
        },
      },
    ];
    return nodes;
  },
};
