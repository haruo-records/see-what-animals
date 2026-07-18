import type { ArrangementModule, Anchor } from "../../registry/module-types";
import { r2 } from "../shared";

/** Placements drawn inward rather than outward, so parts sit inside the mass. */
export const arrangementNested: ArrangementModule = {
  id: "arrangement-nested-01",
  category: "arrangement",
  version: 1,
  label: "nested",
  enabled: true,
  tags: ["layer", "density", "shape"],
  parameters: {
    depth: { type: "number", min: 0.15, max: 0.5, default: 0.3 },
    turn: { type: "number", min: 0.4, max: 2.4, default: 1.1 },
  },
  place({ params }, body, count) {
    const depth = Number(params.depth);
    const turn = Number(params.turn);
    const cx = body.bounds.x + body.bounds.width / 2;
    const cy = body.bounds.y + body.bounds.height / 2;
    const reach = Math.min(body.bounds.width, body.bounds.height) * depth;

    const out: Anchor[] = [];
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1);
      const a = t * turn * Math.PI;
      const rad = reach * (0.35 + 0.65 * t);
      out.push({
        x: r2(cx + Math.cos(a) * rad),
        y: r2(cy + Math.sin(a) * rad),
        // Inward-facing: the appendage folds back toward the centre.
        angle: a + Math.PI,
      });
    }
    return out;
  },
};
