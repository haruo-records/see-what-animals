import type { MotionModule } from "../../registry/module-types";
import { r2 } from "../shared";

/** A small tilt back and forth. It stays in place. */
export const motionSway: MotionModule = {
  id: "motion-sway-01",
  category: "motion",
  version: 1,
  label: "sway",
  enabled: true,
  tags: ["movement", "softness", "continuous"],
  parameters: {
    duration: { type: "number", min: 6, max: 32, default: 15 },
    angle: { type: "number", min: 0.5, max: 6, default: 2.4 },
  },
  animate({ params }) {
    const dur = Number(params.duration);
    const deg = Number(params.angle);
    return {
      target: "outer",
      nodes: [
        {
          tag: "animateTransform",
          attrs: {
            attributeName: "transform",
            type: "rotate",
            additive: "sum",
            values: `${r2(-deg)};${r2(deg)};${r2(-deg)}`,
            dur: `${r2(dur)}s`,
            repeatCount: "indefinite",
          },
        },
      ],
    };
  },
};
