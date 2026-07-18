import type { AppendageModule } from "../../registry/module-types";
import { r2 } from "../shared";

/** A flat panel held away from the form. Manufactured next to something soft. */
export const appendagePlate: AppendageModule = {
  id: "appendage-plate-01",
  category: "appendage",
  version: 1,
  label: "plate",
  enabled: true,
  tags: ["rigidity", "shape", "layer"],
  parameters: {
    width: { type: "number", min: 34, max: 130, default: 76 },
    height: { type: "number", min: 12, max: 70, default: 30 },
    standoff: { type: "number", min: 0, max: 90, default: 34 },
  },
  draw({ params, colors }, at, index) {
    const w = Number(params.width);
    const h = Number(params.height) * (index % 2 === 0 ? 1 : 0.7);
    const off = Number(params.standoff);
    const px = at.x + Math.cos(at.angle) * off;
    const py = at.y + Math.sin(at.angle) * off;
    const deg = (at.angle * 180) / Math.PI;
    return [
      {
        tag: "rect",
        attrs: {
          x: r2(px),
          y: r2(py - h / 2),
          width: r2(w),
          height: r2(h),
          fill: colors.mid,
          stroke: colors.ink,
          "stroke-width": 2.5,
          transform: `rotate(${r2(deg)} ${r2(px)} ${r2(py)})`,
        },
      },
    ];
  },
};
