/**
 * Collection config — one place for versions, thresholds, storage keys and
 * limits. gameVersion is defined here (optionally overridable by env), never
 * hardcoded in multiple files.
 */
export const GAME_VERSION = process.env.NEXT_PUBLIC_GAME_VERSION || "1.0.0";

/** Below this many country responses we do not show a country breakdown. */
export const MIN_COUNTRY_SAMPLE_SIZE = 20;

/** Hard caps so oversized/hostile values can't be stored. */
export const LIMITS = {
  id: 64, // questionId / answerId
  sessionId: 64,
  language: 16,
  referrer: 128,
  utm: 128,
  version: 32,
} as const;

export const ALLOWED_DEVICE_TYPES = ["mobile", "tablet", "desktop", "unknown"] as const;

/** Client storage. Anonymous id kept ~90 days, then rotated. */
export const ANON_SESSION_KEY = "see-what:sid:v1";
export const ANON_SESSION_TTL_DAYS = 90;
export const UTM_FIRST_TOUCH_KEY = "see-what:utm:v1";

export const OBSERVATIONS_ENDPOINT = "/api/observations";
export const RESULTS_ENDPOINT = "/api/observations/results";
