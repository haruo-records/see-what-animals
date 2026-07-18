import type { TransformationModule } from "../../registry/module-types";
import { r2 } from "../shared";

/** A single placement pushed out of line, the rest untouched. */
export const transformationOffset: TransformationModule = {
  id: "transformation-offset-01",
  category: "transformation",
  version: 1,
  label: "offset",
  enabled: true,
  tags: ["spacing", "fragmented", "symmetry"],
  parameters: {
    index: { type: "integer", min: 0, max: 11, default: 1 },
    distance: { type: "number", min: 12, max: 120, default: 48 },
    direction: { type: "number", min: -3.14, max: 3.14, default: 1.2 },
  },
  apply({ params }, anchors) {
    if (anchors.length === 0) return anchors;
    const i = Number(params.index) % anchors.length;
    const dist = Number(params.distance);
    const dir = Number(params.direction);
    return anchors.map((a, n) =>
      n === i
        ? { ...a, x: r2(a.x + Math.cos(dir) * dist), y: r2(a.y + Math.sin(dir) * dist) }
        : a,
    );
  },
};
