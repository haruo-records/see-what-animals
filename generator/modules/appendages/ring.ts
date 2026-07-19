import type { AppendageModule, SvgNode } from "../../registry/module-types";
import { r2, SEAM } from "../shared";

/**
 * A small washer floating near the form. It fits nothing present. Whether it
 * belongs to the form, fell off it, or merely keeps it company is left open.
 */
export const auxRing: AppendageModule = {
  id: "appendage-ring-01",
  category: "appendage",
  version: 2,
  label: "ring",
  enabled: true,
  tags: ["shape", "spacing", "fragmented"],
  parameters: {
    radius: { type: "number", min: 22, max: 44, default: 32 },
    holeRatio: { type: "number", min: 0.34, max: 0.56, default: 0.44 },
    standoff: { type: "number", min: 18, max: 56, default: 34 },
  },
  draw({ params, colors }, at, index) {
    const r = Number(params.radius) * (index % 2 === 0 ? 1 : 0.78);
    const off = Number(params.standoff) + r;
    const cx = at.x + Math.cos(at.angle) * off;
    const cy = at.y + Math.sin(at.angle) * off;
    const nodes: SvgNode[] = [
      {
        tag: "circle",
        attrs: { cx: r2(cx), cy: r2(cy), r: r2(r), fill: colors.ink, stroke: colors.light, "stroke-width": SEAM },
      },
      {
        tag: "circle",
        attrs: { cx: r2(cx), cy: r2(cy), r: r2(r * Number(params.holeRatio)), fill: colors.light },
      },
    ];
    return nodes;
  },
};
