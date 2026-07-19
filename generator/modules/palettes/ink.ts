import type { PaletteModule } from "../../registry/module-types";

/**
 * The palette IS the constraint: solid ink on paper, articulated by
 * paper-coloured seams. `light` must match the ground the work sits on, because
 * the seams and openings are drawn in it — they are negative space, not paint.
 * Replace `ink` with any single colour and the work still holds, which is what
 * lets the same drawing become a shirt, a sticker, or a screen print.
 */
export const paletteInk: PaletteModule = {
  id: "palette-ink-01",
  category: "palette",
  version: 2,
  label: "ink",
  enabled: true,
  tags: ["contrast"],
  parameters: {},
  colors: { ink: "#1c1d1c", mid: "#1c1d1c", light: "#fcfaf6" },
};

export const paletteGraphite: PaletteModule = {
  id: "palette-graphite-01",
  category: "palette",
  version: 2,
  label: "graphite",
  enabled: true,
  tags: ["softness"],
  parameters: {},
  colors: { ink: "#3b3c3a", mid: "#3b3c3a", light: "#fcfaf6" },
};
