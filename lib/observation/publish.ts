import type { ObservationSession } from "@/types";
import { deriveStatus } from "./session-status";

/**
 * PUBLICATION GATE — one function every public surface must pass through.
 *
 * Publication is decided in Asia/Tokyo. A work scheduled for 2026-07-22 becomes
 * public at 2026-07-22 00:00 JST, which is 2026-07-21 15:00 UTC. Deciding this
 * in UTC would publish nine hours early for a Tokyo reader.
 *
 * `deriveStatus` already returns "scheduled" for a session whose startsAt is in
 * the future, so the gate is simply: not scheduled. What was missing was any
 * requirement to *ask*. The sitemap listed every session and the archive route
 * pre-rendered every slug, so a work dated next month was reachable and
 * indexable the moment it was committed. Everything that can expose a work now
 * calls isPublic().
 */
export function isPublic(session: ObservationSession, now: Date = new Date()): boolean {
  return deriveStatus(session, now) !== "scheduled";
}

/** Public sessions only. Use this instead of touching observationSessions directly. */
export function publicSessions(
  sessions: ObservationSession[],
  now: Date = new Date(),
): ObservationSession[] {
  return sessions.filter((s) => isPublic(s, now));
}

/** The Asia/Tokyo calendar date, as YYYY-MM-DD. Used for seeds and publish dates. */
export function tokyoDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Midnight Asia/Tokyo for a YYYY-MM-DD date, as an ISO instant.
 * JST is UTC+9 year-round (no daylight saving), so the offset is a constant.
 */
export function tokyoMidnightIso(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Expected a YYYY-MM-DD date, received "${date}"`);
  }
  return new Date(`${date}T00:00:00+09:00`).toISOString();
}

/** End of day Asia/Tokyo, for a session's closesAt. */
export function tokyoEndOfDayIso(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Expected a YYYY-MM-DD date, received "${date}"`);
  }
  return new Date(`${date}T23:59:59+09:00`).toISOString();
}
