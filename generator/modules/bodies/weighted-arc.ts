import type { BodyModule } from "../../registry/module-types";
import { grow } from "../../render/skeleton";

/**
 * A long curve, almost weightless where it starts and very heavy where it
 * ends. The mass is at the bottom of the arc, so the whole form reads as
 * something holding its own weight up by curving under it.
 *
 * Moving it would mean rolling the heavy end and dragging the thin one.
 */
export const bodyWeightedArc: BodyModule = {
  id: "body-weighted-arc-01",
  category: "body",
  version: 1,
  label: "weighted-arc",
  enabled: true,
  tags: ["shape", "silhouette", "continuous", "density"],
  parameters: {
    length: { type: "number", min: 620, max: 900, default: 760 },
    curve: { type: "number", min: 0.1, max: 0.34, default: 0.22 },
    thinEnd: { type: "number", min: 14, max: 40, default: 24 },
    heavyEnd: { type: "number", min: 130, max: 210, default: 168 },
    heading: { type: "number", min: -2.6, max: -0.5, default: -1.9 },
    voidAt: { type: "number", min: 0.72, max: 0.94, default: 0.84 },
  },
  plan({ cx, cy, params }) {
    const thin = Number(params.thinEnd);
    const heavy = Number(params.heavyEnd);
    const spine = grow({
      x: cx,
      y: cy,
      heading: Number(params.heading),
      length: Number(params.length),
      steps: 22,
      turn: Number(params.curve) / 3,
      // Mass gathers late and fast: nearly nothing for two thirds, then bulk.
      radiusAt: (t) => thin + (heavy - thin) * Math.pow(t, 2.4),
    });
    return {
      spines: [spine],
      voids: [{ t: Number(params.voidAt), rx: heavy * 0.42, ry: heavy * 0.3 }],
      lines: [0.55, 0.7, 0.86],
    };
  },
};
