import type { TransformationModule } from "../../registry/module-types";

/**
 * Redistributes thickness along the body without moving it: one end swells,
 * the other is drawn down to almost nothing. The silhouette stays put while
 * the centre of gravity walks to one end.
 *
 * This is asymmetry designed into the body rather than applied to it — the
 * animal did not get nudged, it grew heavier at one end.
 */
export const deformMassShift: TransformationModule = {
  id: "transformation-mass-shift-01",
  category: "transformation",
  version: 1,
  label: "mass-shift",
  enabled: true,
  tags: ["density", "symmetry", "shape"],
  parameters: {
    toward: { type: "number", min: 0, max: 1, default: 0.85 },
    strength: { type: "number", min: 0.35, max: 1.05, default: 0.7 },
  },
  apply({ params }, spines) {
    const toward = Number(params.toward);
    const strength = Number(params.strength);
    return spines.map((s) =>
      s.map((p, i) => {
        const t = s.length === 1 ? 0 : i / (s.length - 1);
        // Closeness to the target end, squared so the falloff is not linear.
        const pull = 1 - Math.abs(t - toward);
        const factor = 1 + strength * (Math.pow(pull, 2) - 0.45);
        return { ...p, r: Math.max(3, p.r * factor) };
      }),
    );
  },
};
