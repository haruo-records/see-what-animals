"use client";

import { getAnonymousSessionId } from "@/lib/collection/client";

/**
 * Client-side response helpers. One free-text answer per observer per work is
 * stored (the DB enforces one row per anonymous session per animal). Nothing
 * here ever throws into the observation flow.
 */

export type ResponseCount = { text: string; count: number };
export type ResponseSummary = { total: number; responses: ResponseCount[] };

/**
 * Send the "What do you see?" answer for the current work and report whether it
 * saved. Returns true only when the request succeeded AND the API reported
 * ok: true (this includes the dev fallback { ok: true, stored: false } when the
 * DB is not configured). Any HTTP error, ok: false, or thrown exception returns
 * false, so the caller can keep the input and let the person retry.
 */
export async function submitResponse(animalId: string, text: string): Promise<boolean> {
  if (typeof window === "undefined" || !text) return false;
  try {
    const res = await fetch("/api/responses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ animalId, text, anonymousSessionId: getAnonymousSessionId() }),
    });
    const result = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      stored?: boolean;
      error?: string;
    };
    if (!res.ok || result.ok !== true) {
      // eslint-disable-next-line no-console
      console.error("[see-what] response save failed", { status: res.status, error: result.error });
      return false;
    }
    // eslint-disable-next-line no-console
    console.info("[see-what] response saved", { animalId, stored: result.stored });
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[see-what] response save error", error);
    return false;
  }
}

/** "What did people see?" for a work — grouped + counted server-side. Null if unavailable. */
export async function fetchResponseSummary(animalId: string): Promise<ResponseSummary | null> {
  if (typeof window === "undefined" || !animalId) return null;
  try {
    const res = await fetch(`/api/responses/summary?animalId=${encodeURIComponent(animalId)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as ResponseSummary;
  } catch {
    return null;
  }
}
