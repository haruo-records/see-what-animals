import type { BodyModule, SvgNode } from "../../registry/module-types";
import { r2, slab } from "../shared";

/**
 * Rounded slabs piled up, each set down slightly wrong. The pile holds — that
 * is the whole achievement. The topmost slab tilts, as if placed last and
 * least carefully.
 */
export const bodyStack: BodyModule = {
  id: "body-stack-01",
  category: "body",
  version: 2,
  label: "stack",
  enabled: true,
  tags: ["shape", "repetition", "silhouette"],
  parameters: {
    slabs: { type: "integer", min: 2, max: 4, default: 3 },
    baseWidth: { type: "number", min: 240, max: 400, default: 320 },
    slabHeight: { type: "number", min: 95, max: 160, default: 125 },
    drift: { type: "number", min: 8, max: 62, default: 34 },
    taper: { type: "number", min: 0, max: 0.34, default: 0.14 },
    topTilt: { type: "number", min: -16, max: 16, default: 8 },
    contour: { type: "boolean", default: false },
  },
  draw({ cx, cy, params, colors }) {
    const n = Number(params.slabs);
    const baseW = Number(params.baseWidth);
    const slabH = Number(params.slabHeight);
    const drift = Number(params.drift);
    const taper = Number(params.taper);
    const topTilt = Number(params.topTilt);

    // Slabs overlap a little vertically so the white seams appear.
    const pitch = slabH * 0.82;
    const totalH = pitch * (n - 1) + slabH;
    const bottomY = cy + totalH / 2 - slabH / 2;

    const nodes: SvgNode[] = [];
    let minX = cx;
    let maxX = cx;
    for (let i = 0; i < n; i++) {
      const w = baseW * (1 - taper * (i / Math.max(1, n - 1)));
      const dx = i === 0 ? 0 : drift * (i % 2 === 0 ? 0.6 : -1);
      const y = bottomY - pitch * i;
      const isTop = i === n - 1;
      nodes.push(
        slab(cx + dx, y, w, slabH, colors.ink, colors.light, {
          rotate: isTop ? topTilt : 0,
          // Only the base slab carries the inner line; a contour on every slab
          // would turn the pile into upholstery.
          contour: i === 0 && Boolean(params.contour),
        }),
      );
      minX = Math.min(minX, cx + dx - w / 2);
      maxX = Math.max(maxX, cx + dx + w / 2);
    }

    return {
      nodes,
      anchors: [],
      bounds: { x: minX, y: cy - totalH / 2, width: maxX - minX, height: totalH },
    };
  },
};
