import type { PaletteModule } from "../../registry/module-types";

/**
 * Palettes stay close to the site's own surfaces. Colour is not where the
 * interest is meant to sit, and twelve candidates separated only by hue would
 * be exactly the mass-produced feeling this generator is supposed to avoid.
 */
export const paletteInk: PaletteModule = {
  id: "palette-ink-01",
  category: "palette",
  version: 1,
  label: "ink",
  enabled: true,
  tags: ["contrast"],
  parameters: {},
  colors: { ink: "#171817", mid: "#c9c4b8", light: "#f4f0e7" },
};

export const paletteFaint: PaletteModule = {
  id: "palette-faint-01",
  category: "palette",
  version: 1,
  label: "faint",
  enabled: true,
  tags: ["softness"],
  parameters: {},
  colors: { ink: "#4a4a45", mid: "#ddd8cc", light: "#fbf9f4" },
};

export const paletteSlate: PaletteModule = {
  id: "palette-slate-01",
  category: "palette",
  version: 1,
  label: "slate",
  enabled: true,
  tags: ["contrast", "rigidity"],
  colors: { ink: "#2b2e37", mid: "#b6bac4", light: "#eef0f2" },
  parameters: {},
};
