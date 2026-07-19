import type { BodyModule } from "../../registry/module-types";
import { grow } from "../../render/skeleton";

/**
 * A body that winds inward, getting thinner as it goes, and ends buried in its
 * own middle. To go anywhere it would have to unwind first.
 */
export const bodyCoiledSupport: BodyModule = {
  id: "body-coiled-support-01",
  category: "body",
  version: 1,
  label: "coiled-support",
  enabled: true,
  tags: ["shape", "continuous", "density", "repetition"],
  parameters: {
    turns: { type: "number", min: 1.5, max: 2.6, default: 2.0 },
    outerRadius: { type: "number", min: 230, max: 330, default: 280 },
    thickness: { type: "number", min: 70, max: 130, default: 96 },
    tighten: { type: "number", min: 0.4, max: 0.82, default: 0.62 },
    start: { type: "number", min: -3.1, max: 3.1, default: -1.2 },
  },
  plan({ cx, cy, params }) {
    const turns = Number(params.turns);
    const outer = Number(params.outerRadius);
    const th = Number(params.thickness);
    const tighten = Number(params.tighten);
    const start = Number(params.start);
    const steps = 34;
    const sweep = turns * Math.PI * 2;

    // Turning faster as it goes in draws the spiral tighter toward the centre.
    const spine = grow({
      x: cx + Math.cos(start) * outer,
      y: cy + Math.sin(start) * outer,
      heading: start + Math.PI / 2,
      length: outer * sweep * 0.52,
      steps,
      turn: (t) => (sweep / steps) * (1 + tighten * t * 2),
      radiusAt: (t) => th * (1 - 0.66 * t) + 8,
    });

    return {
      spines: [spine],
      voids: [],
      lines: [0.15, 0.42, 0.68],
    };
  },
};
