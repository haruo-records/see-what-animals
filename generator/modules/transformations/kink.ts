import type { TransformationModule } from "../../registry/module-types";

/**
 * Puts one sharp change of direction into the body, at one place. Everything
 * past the kink is rotated about it, so the body has a single joint and has
 * clearly already used it.
 */
export const deformKink: TransformationModule = {
  id: "transformation-kink-01",
  category: "transformation",
  version: 1,
  label: "kink",
  enabled: true,
  tags: ["fragmented", "movement", "rigidity"],
  parameters: {
    at: { type: "number", min: 0.25, max: 0.75, default: 0.5 },
    angle: { type: "number", min: -1.2, max: 1.2, default: 0.75 },
    primaryOnly: { type: "boolean", default: true },
  },
  apply({ params }, spines) {
    const at = Number(params.at);
    const angle = Number(params.angle);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const primaryOnly = Boolean(params.primaryOnly);

    return spines.map((s, spineIndex) => {
      if (primaryOnly && spineIndex !== 0) return s;
      const pivotIndex = Math.floor(at * (s.length - 1));
      const pivot = s[pivotIndex];
      if (!pivot) return s;
      return s.map((p, i) => {
        if (i <= pivotIndex) return p;
        const dx = p.x - pivot.x;
        const dy = p.y - pivot.y;
        return { x: pivot.x + dx * cos - dy * sin, y: pivot.y + dx * sin + dy * cos, r: p.r };
      });
    });
  },
};
