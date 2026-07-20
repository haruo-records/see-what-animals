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

export const SCHEMES: Record<string, Scheme> = {
  teal: { name: "sea green and light grey", a: "#2E8F84", b: PALE },
  ochre: { name: "ochre and light grey", a: "#C79F4C", b: PALE },
  moss: { name: "moss green and light grey", a: "#6E9455", b: PALE },
  slate: { name: "slate blue and light grey", a: "#4A6BA8", b: PALE },
  coral: { name: "coral and light grey", a: "#C86A5E", b: PALE },
  clay: { name: "clay orange and light grey", a: "#CE8149", b: PALE },
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
