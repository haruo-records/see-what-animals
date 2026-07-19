import type { ArrangementModule, Anchor } from "../../registry/module-types";
import { alongSpine } from "../../render/skeleton";

/** Growths spaced down the length of the primary spine, on one side. */
export const arrangementAlongBody: ArrangementModule = {
  id: "arrangement-along-body-01",
  category: "arrangement",
  version: 1,
  label: "along-body",
  enabled: true,
  weight: 3,
  tags: ["repetition", "spacing", "continuous"],
  parameters: {
    from: { type: "number", min: 0.1, max: 0.5, default: 0.25 },
    to: { type: "number", min: 0.55, max: 0.95, default: 0.8 },
  },
  place({ params }, plan, count) {
    const from = Number(params.from);
    const to = Number(params.to);
    const spine = plan.spines[0];
    const out: Anchor[] = [];
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? (from + to) / 2 : from + ((to - from) * i) / (count - 1);
      const at = alongSpine(spine, t);
      out.push({ x: at.x, y: at.y, angle: at.angle });
    }
    return out;
  },
};
