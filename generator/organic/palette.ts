/**
 * Two colours at most, and the pale one is a light grey rather than white.
 *
 * White on a white ground has no silhouette of its own: the lit side of a form
 * disappears into the page and the mass reads as a gap. Light grey keeps every
 * surface on the near side of the background.
 *
 * The chromatic colours sit between natural, mineral and manufactured — muted
 * enough not to read as a toy, saturated enough not to read as stone. Anything
 * brighter and these become products; anything duller and they become fossils.
 */

export type Scheme = { name: string; a: string; b: string };

export const PALE = "#E6E6E6";

/**
 * Colours with some depth in them, and cheerful rather than merely bright.
 *
 * The test is a mug: one of these forms alone on a white glaze, seen every
 * morning for years. That rules out anything fluorescent, which tires within a
 * week, and anything greyed-off, which reads as a stain. What survives is a
 * saturated colour with a dark base under it.
 */
export const SCHEMES: Record<string, Scheme> = {
  teal: { name: "deep sea green and light grey", a: "#1F8C81", b: PALE },
  ochre: { name: "warm amber and light grey", a: "#D69B33", b: PALE },
  moss: { name: "leaf green and light grey", a: "#5E9448", b: PALE },
  slate: { name: "deep blue and light grey", a: "#3C63A8", b: PALE },
  coral: { name: "warm coral and light grey", a: "#D0655A", b: PALE },
  clay: { name: "burnt orange and light grey", a: "#D2743C", b: PALE },
};

/** Moves a colour toward white by `amount`, or toward black if negative. */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const parts = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const to = (c: number) => {
    const v = amount >= 0 ? c + (255 - c) * amount : c * (1 + amount);
    return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  };
  return `#${parts.map(to).join("")}`;
}
