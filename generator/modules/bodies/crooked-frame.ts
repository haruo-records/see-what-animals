import type { BodyModule, SpineNode } from "../../registry/module-types";
import { grow } from "../../render/skeleton";

/**
 * A loop of unequal thickness enclosing a large void, with one corner going
 * the wrong way. It is a frame with nothing in it, holding a shape open around
 * an absence.
 */
export const bodyCrookedFrame: BodyModule = {
  id: "body-crooked-frame-01",
  category: "body",
  version: 1,
  label: "crooked-frame",
  enabled: true,
  tags: ["shape", "spacing", "rigidity", "layer"],
  parameters: {
    width: { type: "number", min: 380, max: 540, default: 450 },
    height: { type: "number", min: 340, max: 520, default: 420 },
    rail: { type: "number", min: 40, max: 82, default: 58 },
    crook: { type: "number", min: 0.3, max: 1.0, default: 0.6 },
    heavySide: { type: "number", min: 1.3, max: 2.6, default: 1.9 },
  },
  plan({ cx, cy, params }) {
    const w = Number(params.width);
    const h = Number(params.height);
    const rail = Number(params.rail);
    const crook = Number(params.crook);
    const heavy = Number(params.heavySide);

    // Four rails as separate spines, meeting at the corners. One corner is
    // pushed inward, so the frame is a quadrilateral that lost an argument.
    const corners: Array<[number, number]> = [
      [cx - w / 2, cy - h / 2],
      [cx + w / 2, cy - h / 2],
      [cx + w / 2 - crook * w * 0.3, cy + h / 2 - crook * h * 0.18],
      [cx - w / 2, cy + h / 2],
    ];

    const rails: SpineNode[][] = [];
    for (let i = 0; i < 4; i++) {
      const [x0, y0] = corners[i];
      const [x1, y1] = corners[(i + 1) % 4];
      const len = Math.hypot(x1 - x0, y1 - y0);
      // The left rail is much heavier than the rest.
      const weight = i === 3 ? heavy : 1;
      rails.push(
        grow({
          x: x0,
          y: y0,
          heading: Math.atan2(y1 - y0, x1 - x0),
          length: len,
          steps: 8,
          turn: 0,
          radiusAt: (t) => rail * weight * (1 - 0.18 * Math.sin(t * Math.PI)),
        }),
      );
    }

    return { spines: rails, voids: [], lines: [0.5] };
  },
};
