import type { ArrangementModule, Anchor } from "../../registry/module-types";
import { r2 } from "../shared";

/** A single run along one edge, all pointing the same way. */
export const arrangementLinear: ArrangementModule = {
  id: "arrangement-linear-01",
  category: "arrangement",
  version: 1,
  label: "linear",
  enabled: true,
  // The workhorse: stubs under the base is the native posture of this language.
  weight: 3,
  tags: ["repetition", "rigidity", "spacing"],
  parameters: {
    edge: { type: "enum", values: ["top", "bottom", "left", "right"], default: "bottom" },
    inset: { type: "number", min: 0, max: 0.3, default: 0.12 },
  },
  place({ params }, body, count) {
    const edge = String(params.edge);
    const inset = Number(params.inset);
    const b = body.bounds;
    const out: Anchor[] = [];

    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : inset + (i / (count - 1)) * (1 - inset * 2);
      if (edge === "top") out.push({ x: r2(b.x + b.width * t), y: r2(b.y), angle: -Math.PI / 2 });
      else if (edge === "bottom") out.push({ x: r2(b.x + b.width * t), y: r2(b.y + b.height), angle: Math.PI / 2 });
      else if (edge === "left") out.push({ x: r2(b.x), y: r2(b.y + b.height * t), angle: Math.PI });
      else out.push({ x: r2(b.x + b.width), y: r2(b.y + b.height * t), angle: 0 });
    }
    return out;
  },
};
