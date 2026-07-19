import type { MotionModule } from "../../registry/module-types";
import { r2 } from "../../render/skeleton";

/** A shallow swell and settle. Small enough that the outline barely moves. */
export const motionPulse: MotionModule = {
  id: "motion-pulse-01",
  category: "motion",
  version: 1,
  label: "pulse",
  enabled: true,
  tags: ["movement", "softness", "continuous"],
  parameters: {
    duration: { type: "number", min: 5, max: 26, default: 12 },
    amount: { type: "number", min: 0.01, max: 0.07, default: 0.03 },
  },
  animate({ params }) {
    const dur = Number(params.duration);
    const amt = Number(params.amount);
    return {
      target: "inner",
      nodes: [
        {
          tag: "animateTransform",
          attrs: {
            attributeName: "transform",
            additive: "sum",
            type: "scale",
            values: `1;${r2(1 + amt)};1`,
            dur: `${r2(dur)}s`,
            repeatCount: "indefinite",
          },
        },
      ],
    };
  },
};
