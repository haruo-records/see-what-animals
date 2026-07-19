import type { BodyModule } from "../../registry/module-types";
import { grow } from "../../render/skeleton";

/**
 * An upright body that divides low down into two supports of different length.
 * It stands, but not level. Whatever it does, it does it leaning.
 */
export const bodySplitColumn: BodyModule = {
  id: "body-split-column-01",
  category: "body",
  version: 1,
  label: "split-column",
  enabled: true,
  tags: ["shape", "rigidity", "silhouette", "symmetry"],
  parameters: {
    height: { type: "number", min: 420, max: 620, default: 520 },
    topWidth: { type: "number", min: 120, max: 210, default: 160 },
    waist: { type: "number", min: 0.3, max: 0.72, default: 0.48 },
    legSpread: { type: "number", min: 0.16, max: 0.62, default: 0.36 },
    legDelta: { type: "number", min: 0.2, max: 0.62, default: 0.4 },
    tilt: { type: "number", min: -0.22, max: 0.22, default: 0.08 },
  },
  plan({ cx, cy, params }) {
    const h = Number(params.height);
    const topW = Number(params.topWidth);
    const waist = Number(params.waist);
    const tilt = Number(params.tilt);
    const legLen = h * 0.42;

    const column = grow({
      x: cx,
      y: cy - h * 0.1,
      heading: Math.PI / 2 + tilt,
      length: h * 0.6,
      steps: 12,
      turn: -tilt / 12,
      // Wide at the top, pinched at the waist: the load funnels down.
      radiusAt: (t) => topW * (1 - (1 - waist) * Math.pow(t, 0.7)),
    });

    const base = column[column.length - 1];
    const spread = Number(params.legSpread);
    const delta = Number(params.legDelta);
    const leg = (dir: number, scale: number) =>
      grow({
        x: base.x,
        y: base.y,
        heading: Math.PI / 2 + spread * dir,
        length: legLen * scale,
        steps: 8,
        turn: -spread * dir * 0.08,
        radiusAt: (t) => base.r * (0.72 - 0.3 * t),
      });

    return {
      spines: [column, leg(-1, 1), leg(1, 1 - delta)],
      voids: [{ t: 0.24, rx: topW * 0.38, ry: topW * 0.26, offset: -topW * 0.2 }],
      lines: [0.5, 0.82],
    };
  },
};
