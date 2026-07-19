import type { AppendageModule, SvgNode } from "../../registry/module-types";
import { grow } from "../../render/skeleton";
import { spineOutline } from "../../render/skeleton";

/**
 * A swelling that grows OUT OF the body and stays attached to it. It starts
 * inside the parent mass, so the two fuse into one silhouette — this is not a
 * part placed nearby, it is the body doing something extra in one spot.
 */
export const growthBud: AppendageModule = {
  id: "appendage-bud-01",
  category: "appendage",
  version: 1,
  label: "bud",
  enabled: true,
  tags: ["shape", "density", "softness"],
  parameters: {
    reach: { type: "number", min: 0.7, max: 1.9, default: 1.2 },
    size: { type: "number", min: 0.5, max: 1.15, default: 0.78 },
    lean: { type: "number", min: -0.8, max: 0.8, default: 0.3 },
  },
  grow({ params, colors }, at, hostRadius, index) {
    // Proportional to its host, so a bud on a thin neck stays a thin bud.
    const reach = hostRadius * Number(params.reach) * (index % 2 === 0 ? 1 : 0.72);
    const size = hostRadius * Number(params.size);
    // Perpendicular to the body, leaning along it.
    const heading = at.angle + Math.PI / 2 + Number(params.lean) * (index % 2 === 0 ? 1 : -1);

    const spine = grow({
      // Starts well inside the parent so there is no seam to see.
      x: at.x - Math.cos(heading) * hostRadius * 0.6,
      y: at.y - Math.sin(heading) * hostRadius * 0.6,
      heading,
      length: reach + hostRadius * 0.6,
      steps: 8,
      turn: 0.03,
      radiusAt: (t) => size * (0.45 + 0.55 * Math.sin(t * Math.PI * 0.85)),
    });

    const nodes: SvgNode[] = [{ tag: "path", attrs: { d: spineOutline(spine), fill: colors.ink } }];
    return nodes;
  },
};
