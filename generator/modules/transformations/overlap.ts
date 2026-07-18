import type { TransformationModule } from "../../registry/module-types";
import { r2 } from "../shared";

/** Two placements pushed into each other until they read as one uncertain unit. */
export const transformationOverlap: TransformationModule = {
  id: "transformation-overlap-01",
  category: "transformation",
  version: 1,
  label: "overlap",
  enabled: true,
  tags: ["layer", "density", "contrast"],
  parameters: {
    index: { type: "integer", min: 0, max: 10, default: 0 },
    closeness: { type: "number", min: 0.3, max: 0.95, default: 0.72 },
  },
  apply({ params }, anchors) {
    if (anchors.length < 2) return anchors;
    const i = Number(params.index) % (anchors.length - 1);
    const k = Number(params.closeness);
    const a = anchors[i];
    const b = anchors[i + 1];
    const moved = { ...b, x: r2(b.x + (a.x - b.x) * k), y: r2(b.y + (a.y - b.y) * k) };
    return anchors.map((n, idx) => (idx === i + 1 ? moved : n));
  },
};
