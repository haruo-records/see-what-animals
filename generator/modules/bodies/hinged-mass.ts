import type { BodyModule } from "../../registry/module-types";
import { grow } from "../../render/skeleton";

/**
 * Two limbs meeting at one sharp joint, one of them far larger than the other.
 * There is exactly one place it can bend, and it is already bent there.
 */
export const bodyHingedMass: BodyModule = {
  id: "body-hinged-mass-01",
  category: "body",
  version: 1,
  label: "hinged-mass",
  enabled: true,
  tags: ["shape", "rigidity", "silhouette", "fragmented"],
  parameters: {
    longArm: { type: "number", min: 330, max: 500, default: 410 },
    shortArm: { type: "number", min: 170, max: 320, default: 240 },
    hinge: { type: "number", min: 0.65, max: 1.9, default: 1.15 },
    thickness: { type: "number", min: 76, max: 140, default: 105 },
    baseAngle: { type: "number", min: -0.5, max: 0.5, default: -0.18 },
    swell: { type: "number", min: 0.1, max: 0.7, default: 0.4 },
  },
  plan({ cx, cy, params }) {
    const th = Number(params.thickness);
    const hinge = Number(params.hinge);
    const base = Number(params.baseAngle);
    const swell = Number(params.swell);

    const armA = grow({
      x: cx,
      y: cy,
      heading: Math.PI + base,
      length: Number(params.longArm),
      steps: 12,
      turn: 0.006,
      // The long arm thickens toward its free end — the weight is out there.
      radiusAt: (t) => th * (0.72 + swell * t),
    });

    const armB = grow({
      x: cx,
      y: cy,
      heading: base - hinge,
      length: Number(params.shortArm),
      steps: 10,
      turn: -0.01,
      radiusAt: (t) => th * (0.9 - 0.45 * t),
    });

    return {
      spines: [armA, armB],
      voids: [],
      plate: { t: 0.95, size: th * 1.6, skew: -0.4 },
      lines: [0.3, 0.62],
    };
  },
};
