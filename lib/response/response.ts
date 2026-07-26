import { isBlockedWord } from "@/lib/naming/moderation";

/**
 * A "what do you see?" response. Unlike the old one-word field, this accepts a
 * short free-text answer: one word, a few words, or a short phrase. Long-form
 * prose is not the intent — the cap keeps answers glanceable and the eventual
 * clustering tractable.
 *
 * IMPORTANT — save vs. display are deliberately separate (see README / the spec):
 *   • SAVE keeps the answer as the person wrote it (only trimmed + whitespace
 *     collapsed). Nothing is bucketed here.
 *   • DISPLAY grouping lives entirely in /api/responses/summary. Today it groups by
 *     `normalizeResponse` (exact match, case-insensitive). Swapping in AI
 *     clustering later touches ONLY that endpoint — this file and the stored
 *     rows never change.
 */
export const MAX_RESPONSE_LENGTH = 30;

export type ResponseReason = "empty" | "too_long" | "url" | "markup" | "blocked" | "invalid";

export type ResponseCheck =
  | { ok: true; text: string }
  | { ok: false; reason: ResponseReason };

/** Collapse runs of whitespace/newlines to single spaces; trim the ends. */
export function tidyResponse(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

/**
 * Trimmed, non-empty, ≤ 30 characters, no URL, no HTML/script markup, no obvious
 * slur. Spaces and coined words are fine — there is no dictionary check and no
 * guidance about what a "right" answer is.
 */
export function validateResponse(raw: unknown): ResponseCheck {
  if (typeof raw !== "string") return { ok: false, reason: "invalid" };
  const text = tidyResponse(raw);
  if (!text) return { ok: false, reason: "empty" };
  if (text.length > MAX_RESPONSE_LENGTH) return { ok: false, reason: "too_long" };
  if (/[<>]/.test(text)) return { ok: false, reason: "markup" };
  if (/(https?:\/\/|www\.|\.[a-z]{2,}\/)/i.test(text)) return { ok: false, reason: "url" };
  if (text.split(/\s+/).some((token) => isBlockedWord(token))) {
    return { ok: false, reason: "blocked" };
  }
  return { ok: true, text };
}

/** The grouping key used by the interim exact-match aggregation. */
export function normalizeResponse(text: string): string {
  return tidyResponse(text).toLowerCase();
}

export function responseHint(reason: ResponseReason): string {
  switch (reason) {
    case "too_long":
      return `Up to ${MAX_RESPONSE_LENGTH} characters.`;
    case "url":
      return "No links.";
    case "markup":
      return "Letters and words only.";
    case "blocked":
      return "Please choose different words.";
    default:
      return "Write what you see.";
  }
}
