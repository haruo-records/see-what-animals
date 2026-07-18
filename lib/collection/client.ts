"use client";

/**
 * Client-side collection helpers. Anonymous only: a rotating UUID session id
 * (no name/email, no cross-site tracking, no fingerprint), first-touch UTM,
 * a coarse referrer host, and the primary language. Everything is best-effort
 * and never throws into the game flow.
 */
import {
  ANON_SESSION_KEY,
  ANON_SESSION_TTL_DAYS,
  GAME_VERSION,
  OBSERVATIONS_ENDPOINT,
  RESULTS_ENDPOINT,
  UTM_FIRST_TOUCH_KEY,
} from "./config";
import type { IncomingAnswer, ResultsResponse } from "@/types/collection";

const DAY_MS = 24 * 60 * 60 * 1000;

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

/** Rotating anonymous id; regenerated after ~90 days. */
export function getAnonymousSessionId(): string {
  if (!hasWindow()) return "00000000-0000-4000-8000-000000000000";
  try {
    const raw = window.localStorage.getItem(ANON_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { id: string; exp: number };
      if (parsed?.id && parsed.exp > Date.now()) return parsed.id;
    }
  } catch {
    /* ignore */
  }
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now().toString(16)}-0000-4000-8000-000000000000`;
  try {
    window.localStorage.setItem(
      ANON_SESSION_KEY,
      JSON.stringify({ id, exp: Date.now() + ANON_SESSION_TTL_DAYS * DAY_MS }),
    );
  } catch {
    /* storage unavailable — id is still returned for this session */
  }
  return id;
}

type Utm = { source: string | null; medium: string | null; campaign: string | null };

/** Store UTM from the FIRST visit; reuse for later answers in this browser. */
export function captureFirstTouchUtm(): Utm {
  const empty: Utm = { source: null, medium: null, campaign: null };
  if (!hasWindow()) return empty;
  try {
    const existing = window.localStorage.getItem(UTM_FIRST_TOUCH_KEY);
    if (existing) return JSON.parse(existing) as Utm;
    const p = new URLSearchParams(window.location.search);
    const utm: Utm = {
      source: p.get("utm_source"),
      medium: p.get("utm_medium"),
      campaign: p.get("utm_campaign"),
    };
    if (utm.source || utm.medium || utm.campaign) {
      window.localStorage.setItem(UTM_FIRST_TOUCH_KEY, JSON.stringify(utm));
      return utm;
    }
  } catch {
    /* ignore */
  }
  return empty;
}

/** Coarse referrer host (no path/query), or "direct". */
export function referrerHost(): string | null {
  if (!hasWindow()) return null;
  const ref = document.referrer;
  if (!ref) return "direct";
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "");
    if (host === window.location.hostname) return "direct";
    return host || "direct";
  } catch {
    return "direct";
  }
}

export function primaryLanguage(): string | null {
  if (!hasWindow()) return null;
  return navigator.language || null;
}

/**
 * Saves the answers. Awaited by the caller so the POST completes before
 * navigation. Throws on a non-2xx response (and logs status + body) so failures
 * are visible instead of silently swallowed.
 */
export async function submitObservations(
  sessionId: string,
  answers: IncomingAnswer[],
): Promise<void> {
  /* eslint-disable no-console */
  if (!hasWindow()) {
    console.info("[see-what] submitObservations skipped: no window");
    return;
  }
  if (!sessionId) {
    console.info("[see-what] submitObservations skipped: no sessionId");
    return;
  }
  if (answers.length === 0) {
    console.info("[see-what] submitObservations skipped: no answers (all skipped?)");
    return;
  }
  try {
    const utm = captureFirstTouchUtm();
    const body = {
      sessionId,
      gameVersion: GAME_VERSION,
      language: primaryLanguage(),
      referrer: referrerHost(),
      utmSource: utm.source,
      utmMedium: utm.medium,
      utmCampaign: utm.campaign,
      anonymousSessionId: getAnonymousSessionId(),
      answers,
    };
    console.info("[see-what] POST /api/observations →", body);
    const res = await fetch(OBSERVATIONS_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[see-what] POST /api/observations failed", res.status, text);
      throw new Error(`Observation save failed: ${res.status} ${text}`);
    }
    console.info("[see-what] POST /api/observations status", res.status);
  } catch (error) {
    console.error("[see-what] POST /api/observations error", error);
    throw error;
  }
  /* eslint-enable no-console */
}

export async function fetchResults(
  sessionId: string,
  questionId: string,
  country?: string,
): Promise<ResultsResponse | null> {
  if (!hasWindow() || !sessionId) return null;
  try {
    const params = new URLSearchParams({ sessionId, questionId });
    if (country) params.set("country", country);
    const res = await fetch(`${RESULTS_ENDPOINT}?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as ResultsResponse;
  } catch {
    return null;
  }
}
