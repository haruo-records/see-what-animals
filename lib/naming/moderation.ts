/**
 * Minimal, conservative word guard for the one-word field and generated names.
 * This is a light filter, NOT a full moderation system — extend BLOCKED with a
 * maintained list or swap in a moderation API for production coverage.
 */
const BLOCKED = new Set<string>([
  "fuck", "fucker", "fucking", "shit", "bitch", "asshole", "dick", "cock",
  "pussy", "cunt", "slut", "whore", "bastard", "nigger", "faggot", "retard",
  "rape", "nazi",
]);

/** Normalize to lowercase alphanumerics before checking. */
export function isBlockedWord(word: string): boolean {
  const w = word.toLowerCase().replace(/[^a-z0-9]/g, "");
  return w.length > 0 && BLOCKED.has(w);
}
