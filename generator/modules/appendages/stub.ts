import type { AppendageModule, SvgNode } from "../../registry/module-types";
import { r2, mass, SEAM } from "../shared";

/**
 * Small rounded supports. Not legs — they are far too short and too few to
 * carry anything anywhere. They keep the mass just off the ground, which the
 * mass appears to consider sufficient.
 */
export const auxStub: AppendageModule = {
  id: "appendage-stub-01",
  category: "appendage",
  version: 2,
  label: "stub",
  enabled: true,
  tags: ["shape", "repetition", "softness"],
  parameters: {
    length: { type: "number", min: 34, max: 78, default: 52 },
    width: { type: "number", min: 24, max: 42, default: 32 },
    unevenness: { type: "number", min: 0, max: 0.4, default: 0.18 },
  },
  draw({ params, colors }, at, index) {
    // One stub is shorter than the rest. The stance copes.
    const uneven = index % 3 === 1 ? 1 - Number(params.unevenness) : 1;
    const len = Number(params.length) * uneven;
    const w = Number(params.width);
    // Stubs always hang straight down, wherever the arrangement puts them.
    // A support pointing sideways is a spike; the whole joke of these forms is
    // that they stand, slightly wrong, and standing happens downward.
    const nx = 0;
    const ny = 1;
    // Start slightly inside the mass so the seam outline shows the joint.
    const sx = at.x - nx * SEAM;
    const sy = at.y - ny * SEAM;
    const cx = sx + nx * (len / 2);
    const cy = sy + ny * (len / 2);
    const deg = 0;
    const nodes: SvgNode[] = [
      {
        ...mass(
          { x: r2(cx - w / 2), y: r2(cy - len / 2), width: r2(w), height: r2(len), rx: r2(w * 0.46) },
          "rect",
          colors.ink,
          colors.light,
        ),
        attrs: {
          x: r2(cx - w / 2),
          y: r2(cy - len / 2),
          width: r2(w),
          height: r2(len),
          rx: r2(w * 0.46),
          fill: colors.ink,
          stroke: colors.light,
          "stroke-width": SEAM,
          transform: `rotate(${r2(deg)} ${r2(cx)} ${r2(cy)})`,
        },
      },
    ];
    return nodes;
  },
};
