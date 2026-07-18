import type { TransformationModule } from "../../registry/module-types";
import { r2 } from "../shared";

/**
 * The spacing is widened on one side only. The run stays complete — nothing is
 * removed — but its rhythm is no longer even.
 */
export const transformationAsymmetricGap: TransformationModule = {
  id: "transformation-asymmetric-gap-01",
  category: "transformation",
  version: 1,
  label: "asymmetric-gap",
  enabled: true,
  tags: ["spacing", "symmetry", "repetition"],
  parameters: {
    splitAt: { type: "number", min: 0.25, max: 0.75, default: 0.5 },
    push: { type: "number", min: 10, max: 110, default: 44 },
  },
  apply({ cx, params }, anchors) {
    const split = Math.floor(Number(params.splitAt) * anchors.length);
    const push = Number(params.push);
    return anchors.map((a, i) => {
      if (i < split) return a;
      const dir = a.x >= cx ? 1 : -1;
      return { ...a, x: r2(a.x + push * dir) };
    });
  },
};
