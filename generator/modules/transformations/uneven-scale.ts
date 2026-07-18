import type { TransformationModule } from "../../registry/module-types";
import { r2 } from "../shared";

/**
 * Placements pulled toward or away from the centre by varying amounts, which
 * makes the appendages read at different sizes without changing their module.
 */
export const transformationUnevenScale: TransformationModule = {
  id: "transformation-uneven-scale-01",
  category: "transformation",
  version: 1,
  label: "uneven-scale",
  enabled: true,
  tags: ["density", "spacing", "shape"],
  parameters: {
    amount: { type: "number", min: 0.05, max: 0.45, default: 0.22 },
    period: { type: "integer", min: 2, max: 5, default: 3 },
  },
  apply({ cx, cy, params }, anchors) {
    const amount = Number(params.amount);
    const period = Number(params.period);
    return anchors.map((a, i) => {
      const f = 1 + (i % period === 0 ? amount : -amount * 0.5);
      return {
        ...a,
        x: r2(cx + (a.x - cx) * f),
        y: r2(cy + (a.y - cy) * f),
      };
    });
  },
};
