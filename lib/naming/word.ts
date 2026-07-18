import { isBlockedWord } from "./moderation";

export const MAX_WORD_LENGTH = 20;

export type WordReason =
  | "empty"
  | "whitespace"
  | "too_long"
  | "url"
  | "markup"
  | "blocked"
  | "invalid";

export type WordCheck = { ok: true; word: string } | { ok: false; reason: WordReason };

/**
 * One word only. Trimmed, non-empty, no spaces/newlines, ≤ 20 chars, no URL,
 * no HTML/script markup, not obviously inappropriate. Coined words and
 * onomatopoeia are allowed — there is no dictionary check.
 */
export function validateWord(raw: unknown): WordCheck {
  if (typeof raw !== "string") return { ok: false, reason: "invalid" };
  const word = raw.trim();
  if (!word) return { ok: false, reason: "empty" };
  if (/\s/.test(word)) return { ok: false, reason: "whitespace" };
  if (word.length > MAX_WORD_LENGTH) return { ok: false, reason: "too_long" };
  if (/[<>]/.test(word)) return { ok: false, reason: "markup" };
  if (/(https?:\/\/|www\.|\.[a-z]{2,}\/)/i.test(word)) return { ok: false, reason: "url" };
  if (isBlockedWord(word)) return { ok: false, reason: "blocked" };
  return { ok: true, word };
}

export function wordHint(reason: WordReason): string {
  switch (reason) {
    case "whitespace":
      return "One word — no spaces.";
    case "too_long":
      return `Up to ${MAX_WORD_LENGTH} characters.`;
    case "url":
      return "No links.";
    case "markup":
      return "Letters only.";
    case "blocked":
      return "Please choose another word.";
    default:
      return "One word only.";
  }
}
