import type { BodyModule } from "../../registry/module-types";
import { r2, slab } from "../shared";

/**
 * One thick tube, folded once. Two segments meet at a joint that clearly was
 * not designed for this angle. Whether it bent, or was made bent, is not
 * decidable — and it plainly cannot un-bend.
 */
export const bodyBend: BodyModule = {
  id: "body-bend-01",
  category: "body",
  version: 2,
  label: "bend",
  enabled: true,
  tags: ["shape", "silhouette", "rigidity"],
  parameters: {
    lengthA: { type: "number", min: 190, max: 330, default: 260 },
    lengthB: { type: "number", min: 140, max: 290, default: 210 },
    thickness: { type: "number", min: 105, max: 165, default: 132 },
    foldDeg: { type: "number", min: 38, max: 112, default: 72 },
    baseDeg: { type: "number", min: -25, max: 25, default: -8 },
    contour: { type: "boolean", default: false },
  },
  draw({ cx, cy, params, colors }) {
    const lenA = Number(params.lengthA);
    const lenB = Number(params.lengthB);
    const t = Number(params.thickness);
    const fold = Number(params.foldDeg);
    const base = Number(params.baseDeg);

    // Joint sits at the composition centre; each segment extends away from it.
    // Each is a rounded slab whose centre is half its length from the joint.
    const aDeg = 180 + base;
    const bDeg = base - fold;
    const rad = (d: number) => (d * Math.PI) / 180;
    const aCx = cx + Math.cos(rad(aDeg)) * (lenA / 2 - t * 0.2);
    const aCy = cy + Math.sin(rad(aDeg)) * (lenA / 2 - t * 0.2);
    const bCx = cx + Math.cos(rad(bDeg)) * (lenB / 2 - t * 0.2);
    const bCy = cy + Math.sin(rad(bDeg)) * (lenB / 2 - t * 0.2);

    const reach = Math.max(lenA, lenB) + t;
    return {
      nodes: [
        slab(aCx, aCy, lenA, t, colors.ink, colors.light, { rotate: aDeg, rx: t * 0.46, contour: Boolean(params.contour) }),
        slab(bCx, bCy, lenB, t, colors.ink, colors.light, { rotate: bDeg, rx: t * 0.46 }),
      ],
      anchors: [],
      bounds: { x: r2(cx - reach / 1.6), y: r2(cy - reach / 1.6), width: r2(reach * 1.25), height: r2(reach * 1.25) },
    };
  },
};
