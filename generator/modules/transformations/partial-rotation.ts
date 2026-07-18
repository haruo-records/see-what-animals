import type { TransformationModule } from "../../registry/module-types";
import { r2 } from "../shared";

/** Only part of the set is turned. The set stops agreeing with itself. */
export const transformationPartialRotation: TransformationModule = {
  id: "transformation-partial-rotation-01",
  category: "transformation",
  version: 1,
  label: "partial-rotation",
  enabled: true,
  tags: ["symmetry", "movement", "fragmented"],
  parameters: {
    from: { type: "number", min: 0, max: 1, default: 0.55 },
    angle: { type: "number", min: -1.5, max: 1.5, default: 0.7 },
  },
  apply({ cx, cy, params }, anchors) {
    const from = Math.floor(Number(params.from) * anchors.length);
    const angle = Number(params.angle);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return anchors.map((a, i) => {
      if (i < from) return a;
      const dx = a.x - cx;
      const dy = a.y - cy;
      return {
        x: r2(cx + dx * cos - dy * sin),
        y: r2(cy + dx * sin + dy * cos),
        angle: a.angle + angle,
      };
    });
  },
};
