import type { TransformationModule } from "../../registry/module-types";

/**
 * Narrows the body sharply at one point along its length. A waist that thin
 * turns one mass into two joined by almost nothing — the tension between a
 * heavy form and the little that holds it together.
 */
export const deformPinch: TransformationModule = {
  id: "transformation-pinch-01",
  category: "transformation",
  version: 1,
  label: "pinch",
  enabled: true,
  tags: ["density", "shape", "fragmented"],
  parameters: {
    at: { type: "number", min: 0.22, max: 0.78, default: 0.45 },
    depth: { type: "number", min: 0.5, max: 0.88, default: 0.72 },
    width: { type: "number", min: 0.08, max: 0.24, default: 0.14 },
  },
  apply({ params }, spines) {
    const at = Number(params.at);
    const depth = Number(params.depth);
    const width = Number(params.width);

    return spines.map((s, spineIndex) => {
      if (spineIndex !== 0) return s;
      return s.map((p, i) => {
        const t = s.length === 1 ? 0 : i / (s.length - 1);
        const d = Math.abs(t - at);
        if (d > width) return p;
        // Cosine well: narrowest exactly at `at`, back to full width at the rim.
        const bite = depth * (0.5 + 0.5 * Math.cos((d / width) * Math.PI));
        return { ...p, r: Math.max(4, p.r * (1 - bite)) };
      });
    });
  },
};
