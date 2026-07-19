/**
 * ONE KIND, ONE COLOUR.
 *
 * These six are the same creature living in the same place, so they share a
 * colour exactly. Six different colours would have made six specimens from six
 * collections; one colour makes a handful of the same thing, which is what a
 * pocket of found objects actually looks like.
 *
 * The line colour is exactly the ground colour, and this is structural rather
 * than aesthetic. The pale boundaries are made by painting each part's outline
 * in the ground colour before filling it: over a part behind, that reads as a
 * boundary; over bare ground it is invisible. If line and ground ever differed,
 * every outer silhouette would gain a drawn edge and the bodies would go back
 * to looking like stickers.
 *
 * Low saturation, mid value. A saturated body reads as a toy and a very dark
 * one reads as a symbol, and neither is a thing you would put in your pocket.
 */

export type Palette = {
  habitat: string;
  body: string;
  ground: string;
  /** A near neighbour in hue, for a body that grew two materials. */
  second?: string;
};

/**
 * Dusty mint, the colour of the whole kind. Slightly green, slightly grey,
 * nothing insistent about it — a thing this colour is easy to miss and easy to
 * like once noticed.
 */
export const KIND: Palette = {
  habitat: "found together, in the same layer, by the same water",
  body: "#9db8ae",
  ground: "#f2f3f0",
  second: "#adc4bb",
};

/** For checking a body still reads without colour. Never the default. */
export const MONO: Palette = {
  habitat: "printed in one colour",
  body: "#1c1d1c",
  ground: "#ffffff",
};
