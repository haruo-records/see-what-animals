import type { MotionModule } from "../../registry/module-types";
import { r2 } from "../shared";

/**
 * The silhouette holds completely still while the interior drifts. This is the
 * motion the project cares about most: something is going on, but the form is
 * not going anywhere, so the movement cannot be read as travel.
 */
export const motionInternalShift: MotionModule = {
  id: "motion-internal-shift-01",
  category: "motion",
  version: 1,
  label: "internal-shift",
  enabled: true,
  tags: ["movement", "layer", "continuous"],
  parameters: {
    duration: { type: "number", min: 10, max: 60, default: 26 },
    distance: { type: "number", min: 4, max: 44, default: 18 },
    angle: { type: "number", min: -3.14, max: 3.14, default: 0.4 },
  },
  animate({ params }) {
    const dur = Number(params.duration);
    const dist = Number(params.distance);
    const a = Number(params.angle);
    const dx = r2(Math.cos(a) * dist);
    const dy = r2(Math.sin(a) * dist);
    return {
      target: "inner",
      nodes: [
        {
          tag: "animateTransform",
          attrs: {
            attributeName: "transform",
            additive: "sum",
            type: "translate",
            values: `0 0;${dx} ${dy};0 0`,
            dur: `${r2(dur)}s`,
            repeatCount: "indefinite",
          },
        },
      ],
    };
  },
};
