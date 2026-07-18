import type { AppendageModule } from "../../registry/module-types";
import { r2 } from "../shared";

/** A single hair-thin stroke leaving the form. Too fine to read as a limb. */
export const appendageThinLine: AppendageModule = {
  id: "appendage-thin-line-01",
  category: "appendage",
  version: 1,
  label: "thin-line",
  enabled: true,
  tags: ["shape", "rigidity", "fragmented"],
  parameters: {
    length: { type: "number", min: 50, max: 220, default: 130 },
    thickness: { type: "number", min: 1.5, max: 7, default: 3 },
    bend: { type: "number", min: -0.7, max: 0.7, default: 0.2 },
  },
  draw({ params, colors }, at, index) {
    const len = Number(params.length) * (1 - (index % 3) * 0.12);
    const bend = Number(params.bend);
    const ex = at.x + Math.cos(at.angle) * len;
    const ey = at.y + Math.sin(at.angle) * len;
    const mx = at.x + Math.cos(at.angle + bend) * len * 0.6;
    const my = at.y + Math.sin(at.angle + bend) * len * 0.6;
    return [
      {
        tag: "path",
        attrs: {
          d: `M ${r2(at.x)} ${r2(at.y)} Q ${r2(mx)} ${r2(my)} ${r2(ex)} ${r2(ey)}`,
          fill: "none",
          stroke: colors.ink,
          "stroke-width": r2(Number(params.thickness)),
          "stroke-linecap": "round",
        },
      },
    ];
  },
};
