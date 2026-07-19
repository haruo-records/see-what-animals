import type { ArrangementModule, Anchor } from "../../registry/module-types";
import { alongSpine } from "../../render/skeleton";

/** Growths at the far end of the body, where the mass runs out. */
export const arrangementAtExtremity: ArrangementModule = {
  id: "arrangement-at-extremity-01",
  category: "arrangement",
  version: 1,
  label: "at-extremity",
  enabled: true,
  weight: 2,
  tags: ["spacing", "density", "silhouette"],
  parameters: {
    end: { type: "enum", values: ["head", "tail"], default: "head" },
    cluster: { type: "number", min: 0.03, max: 0.16, default: 0.08 },
  },
  place({ params }, plan, count) {
    const head = String(params.end) === "head";
    const cluster = Number(params.cluster);
    const spine = plan.spines[0];
    const out: Anchor[] = [];
    for (let i = 0; i < count; i++) {
      const base = head ? 0.94 : 0.06;
      const t = Math.min(0.99, Math.max(0.01, base + (head ? -1 : 1) * cluster * i));
      const at = alongSpine(spine, t);
      out.push({ x: at.x, y: at.y, angle: at.angle });
    }
    return out;
  },
};
