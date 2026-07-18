import type { AppendageModule } from "../../registry/module-types";
import { r2 } from "../shared";

/** A stub that is not quite touching. The near-miss is the point. */
export const appendageShortBar: AppendageModule = {
  id: "appendage-short-bar-01",
  category: "appendage",
  version: 1,
  label: "short-bar",
  enabled: true,
  tags: ["rigidity", "spacing", "fragmented"],
  parameters: {
    length: { type: "number", min: 20, max: 96, default: 48 },
    thickness: { type: "number", min: 5, max: 26, default: 12 },
    detach: { type: "number", min: 0, max: 44, default: 16 },
  },
  draw({ params, colors }, at, index) {
    const len = Number(params.length);
    const th = Number(params.thickness);
    // Every third bar sits flush; the rest float clear of the form.
    const gap = index % 3 === 0 ? 0 : Number(params.detach);
    const sx = at.x + Math.cos(at.angle) * gap;
    const sy = at.y + Math.sin(at.angle) * gap;
    return [
      {
        tag: "path",
        attrs: {
          d: `M ${r2(sx)} ${r2(sy)} L ${r2(sx + Math.cos(at.angle) * len)} ${r2(sy + Math.sin(at.angle) * len)}`,
          fill: "none",
          stroke: colors.ink,
          "stroke-width": r2(th),
          "stroke-linecap": "butt",
        },
      },
    ];
  },
};
