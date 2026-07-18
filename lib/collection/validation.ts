/**
 * Hand-rolled validation/sanitizing (no runtime dependency). Keeps the API
 * strict and prevents oversized or hostile values from being stored.
 */
import { ALLOWED_DEVICE_TYPES, LIMITS } from "./config";
import type { DeviceType, IncomingAnswer } from "@/types/collection";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ID_RE = /^[a-z0-9][a-z0-9._-]{0,63}$/i;
const COUNTRY_RE = /^[A-Z]{2}$/;

export function isUuid(v: unknown): v is string {
  return typeof v === "string" && UUID_RE.test(v);
}

export function isValidId(v: unknown): v is string {
  return typeof v === "string" && ID_RE.test(v);
}

/** Trim to a max length; return null for empty/invalid. */
export function clamp(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  return s.slice(0, max);
}

export function normalizeCountry(v: string | null | undefined): string | null {
  if (!v) return null;
  const c = v.trim().toUpperCase();
  // Vercel sends "XX" (or empty) when unknown.
  if (c === "XX" || c === "T1" || !COUNTRY_RE.test(c)) return null;
  return c;
}

/**
 * For STORAGE: always returns a value. A valid ISO alpha-2 code, or "XX" when the
 * country is unknown / not determinable (never null; the column is NOT NULL).
 */
export function countryForStorage(v: string | null | undefined): string {
  return normalizeCountry(v) ?? "XX";
}

/**
 * For the results `country` query param.
 * - undefined/null/empty  -> null   (no filter; global)
 * - valid 2-letter code   -> "JP"   ("XX" is allowed as the unknown bucket)
 * - anything else         -> "invalid" (caller returns 400)
 */
export function parseCountryParam(v: string | null | undefined): string | null | "invalid" {
  if (v == null || v.trim() === "") return null;
  const c = v.trim().toUpperCase();
  return COUNTRY_RE.test(c) ? c : "invalid";
}

export function normalizeDeviceType(v: unknown): DeviceType {
  return typeof v === "string" && (ALLOWED_DEVICE_TYPES as readonly string[]).includes(v)
    ? (v as DeviceType)
    : "unknown";
}

/** Keep only a language tag like "ja" or "ja-JP". */
export function sanitizeLanguage(v: unknown): string | null {
  const s = clamp(v, LIMITS.language);
  if (!s) return null;
  return /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/.test(s) ? s : s.slice(0, 8);
}

export function sanitizeReferrer(v: unknown): string | null {
  const s = clamp(v, LIMITS.referrer);
  if (!s) return null;
  // Store a bare host/token only — never full URLs or query strings.
  return s.replace(/[^a-z0-9.\-_]/gi, "").slice(0, LIMITS.referrer) || null;
}

export function sanitizeUtm(v: unknown): string | null {
  const s = clamp(v, LIMITS.utm);
  if (!s) return null;
  return s.replace(/[^\w.\- ]/g, "").slice(0, LIMITS.utm) || null;
}

/** Validate + normalize the answers array. Returns [] if anything is off. */
export function parseAnswers(input: unknown): IncomingAnswer[] {
  if (!Array.isArray(input)) return [];
  const out: IncomingAnswer[] = [];
  for (const raw of input.slice(0, 20)) {
    if (!raw || typeof raw !== "object") continue;
    const a = raw as Record<string, unknown>;
    const questionId = clamp(a.questionId, LIMITS.id);
    const answerId = clamp(a.answerId, LIMITS.id);
    const questionVersion = clamp(a.questionVersion, LIMITS.version) ?? "1";
    if (!questionId || !answerId) continue;
    if (!isValidId(questionId) || !isValidId(answerId)) continue;
    out.push({ questionId, answerId, questionVersion });
  }
  return out;
}
