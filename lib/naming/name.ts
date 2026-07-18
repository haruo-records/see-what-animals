import { isBlockedWord } from "./moderation";

export function toTitleCase(word: string): string {
  return word.length === 0 ? word : word[0].toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Accept a model reply only if it is exactly two alphabetic words. Returns the
 * name in Title Case, or null if it is not a valid two-word name.
 */
export function parseTwoWordName(raw: string): string | null {
  const cleaned = raw
    .trim()
    .replace(/^["'`*\s]+|["'`*.!?,;:\s]+$/g, "")
    .trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length !== 2) return null;
  const ok = parts.every((p) => /^[A-Za-z][A-Za-z'-]*$/.test(p));
  if (!ok) return null;
  return parts.map(toTitleCase).join(" ");
}

export function isBlockedName(name: string): boolean {
  return name.split(/\s+/).some((w) => isBlockedWord(w));
}

/**
 * Safe fallback used only if the model fails repeatedly. Deliberately distinct
 * from the direction examples in the prompt. Picks the first not already used.
 */
const FALLBACK_POOL = [
  "Amber Ledger", "Copper Rumor", "Salt Lantern", "Pocket Weather", "Marble Hush",
  "Iron Meadow", "Candle Drift", "Gravel Choir", "Linen Signal", "Dusty Comet",
  "Wool Circuit", "Plum Anchor", "Chalk Harbor", "Ember Notion", "Slate Whistle",
];

export function pickFallbackName(usedLower: Set<string>): string {
  for (const n of FALLBACK_POOL) {
    if (!usedLower.has(n.toLowerCase()) && !isBlockedName(n)) return n;
  }
  return `${FALLBACK_POOL[0]} ${Math.floor(Math.random() * 90 + 10)}`;
}
