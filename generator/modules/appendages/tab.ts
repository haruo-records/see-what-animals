import type { AppendageModule, SvgNode } from "../../registry/module-types";
import { r2, SEAM } from "../shared";

/**
 * A small flat tab projecting from the form — the kind of feature that exists
 * to be gripped, hung, or slotted by something that is not around.
 */
export const auxTab: AppendageModule = {
  id: "appendage-tab-01",
  category: "appendage",
  version: 2,
  label: "tab",
  enabled: true,
  tags: ["shape", "rigidity", "fragmented"],
  parameters: {
    length: { type: "number", min: 44, max: 90, default: 64 },
    width: { type: "number", min: 18, max: 34, default: 24 },
  },
  draw({ params, colors }, at, index) {
    const len = Number(params.length) * (index % 2 === 0 ? 1 : 0.72);
    const w = Number(params.width);
    const nx = Math.cos(at.angle);
    const ny = Math.sin(at.angle);
    const cx = at.x + nx * (len / 2 - SEAM);
    const cy = at.y + ny * (len / 2 - SEAM);
    const deg = (at.angle * 180) / Math.PI;
    const nodes: SvgNode[] = [
      {
        tag: "rect",
        attrs: {
          x: r2(cx - len / 2),
          y: r2(cy - w / 2),
          width: r2(len),
          height: r2(w),
          rx: r2(w * 0.32),
          fill: colors.ink,
          stroke: colors.light,
          "stroke-width": SEAM,
          transform: `rotate(${r2(deg)} ${r2(cx)} ${r2(cy)})`,
        },
      },
    ];
    return nodes;
  },
};
