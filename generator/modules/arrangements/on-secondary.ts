import type { ArrangementModule, Anchor } from "../../registry/module-types";
import { alongSpine } from "../../render/skeleton";

/**
 * Growths on a secondary spine — the shorter branch, the trailing tail, the
 * lighter rail. Whatever is happening happens to the lesser part of the body.
 */
export const arrangementOnSecondary: ArrangementModule = {
  id: "arrangement-on-secondary-01",
  category: "arrangement",
  version: 1,
  label: "on-secondary",
  enabled: true,
  weight: 2,
  tags: ["spacing", "fragmented", "layer"],
  parameters: {
    spread: { type: "number", min: 0.14, max: 0.44, default: 0.28 },
    from: { type: "number", min: 0.2, max: 0.6, default: 0.4 },
  },
  place({ params }, plan, count) {
    // Falls back to the primary when the body has only one spine.
    const spine = plan.spines[plan.spines.length - 1];
    const from = Number(params.from);
    const spread = Number(params.spread);
    const out: Anchor[] = [];
    for (let i = 0; i < count; i++) {
      const t = Math.min(0.96, from + spread * i);
      const at = alongSpine(spine, t);
      out.push({ x: at.x, y: at.y, angle: at.angle });
    }
    return out;
  },
};
