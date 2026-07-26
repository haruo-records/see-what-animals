import type { ObservationSession } from "@/types";

/**
 * SESSIONS — one per week, switched by hand.
 *
 * MANUAL OPERATION (current): publishing, closing, and showing results are all
 * done by an admin editing this file and redeploying. There is no clock-based
 * auto-publish, auto-close, or auto-switch to results.
 *   • Open for answers      → status: "open"
 *   • Results only          → status: "closed"  (the form is hidden; "What
 *                             people saw" shows in its place)
 *   • Publish the next work  → give this session a new observationNumber +
 *                             animalId (or append a fresh session), status "open"
 *
 * startsAt / closesAt are kept only as the dates shown on the record; while a
 * `status` is set they do NOT drive open/closed. Remove `status` to fall back to
 * date-derived status.
 *
 * FUTURE AUTOMATION (kept, dormant): weeklyCycleJst() below computes the
 * Sunday-06:00-JST → Saturday-06:00-JST window. Flip USE_LIVE_WEEKLY_CYCLE to
 * true and drop the explicit `status` to let the clock run the rhythm. Not used
 * today.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * Dormant weekly helper (see FUTURE AUTOMATION above):
 *   startsAt = most recent Sunday 06:00 JST · closesAt = following Saturday 06:00 JST.
 */
function weeklyCycleJst(now: Date = new Date()): { startsAt: string; closesAt: string } {
  const jst = new Date(now.getTime() + JST_OFFSET_MS);
  const daysSinceSunday = jst.getUTCDay();
  let startUtcMs =
    Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate() - daysSinceSunday, 6, 0, 0) -
    JST_OFFSET_MS;
  if (now.getTime() < startUtcMs) startUtcMs -= 7 * DAY_MS;
  const closeUtcMs = startUtcMs + 6 * DAY_MS;
  return { startsAt: new Date(startUtcMs).toISOString(), closesAt: new Date(closeUtcMs).toISOString() };
}

/** Manual today. Set true (and drop `status` below) to hand the rhythm to the clock. */
const USE_LIVE_WEEKLY_CYCLE = false;

// The dates shown on the record for the current manual run (Sunday 06:00 JST →
// Saturday 06:00 JST). Edit these when you publish a new week.
const FEATURED_STARTS_AT = "2026-07-19T06:00:00.000+09:00";
const FEATURED_CLOSES_AT = "2026-07-25T06:00:00.000+09:00";

const featuredWindow = USE_LIVE_WEEKLY_CYCLE
  ? weeklyCycleJst()
  : {
      startsAt: new Date(FEATURED_STARTS_AT).toISOString(),
      closesAt: new Date(FEATURED_CLOSES_AT).toISOString(),
    };

export const observationSessions: ObservationSession[] = [
  {
    id: "observation-023",
    slug: "observation-023",
    observationNumber: "023",
    animalId: "animal-023",
    intro: "Take a moment before you decide what it is.",
    startsAt: featuredWindow.startsAt,
    closesAt: featuredWindow.closesAt,
    // MANUAL SWITCH: "open" = accepting answers. Change to "closed" to hide the
    // form and show only "What people saw" for this week.
    status: "open",
    questionIds: ["q-see"],
    allowPostCloseResponses: false,
    featured: true,
  },
  // The Archive opens empty on purpose. Append a past week here exactly like the
  // current one (new slug + observationNumber, an animalId in
  // animal-references.ts, questionIds: ["q-see"], status: "closed",
  // and a `closesAt` in the past) to bring an entry back.
];

export function getSessionBySlug(slug: string): ObservationSession | undefined {
  return observationSessions.find((s) => s.slug === slug);
}

export function getSessionById(id: string): ObservationSession | undefined {
  return observationSessions.find((s) => s.id === id);
}
