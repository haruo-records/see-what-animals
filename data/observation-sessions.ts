import type { ObservationSession } from "@/types";

/**
 * SESSIONS
 * Period lives here (startsAt/closesAt), never in code. A 14- or 30-day run is
 * just different dates. status is derived from the clock (see lib/observation/
 * session-status.ts); set an explicit `status` only to override.
 *
 * ADD A SESSION: append an entry with a new slug + observationNumber, point
 * animalId at an entry in animal-references.ts, and list questionIds.
 */

/**
 * ── DEMO vs PRODUCTION SCHEDULE ─────────────────────────────────────────────
 * The featured session needs to look "open" while you evaluate the template, so
 * by default it uses a rolling weekly window (weeklyWindow()).
 *
 * ►► BEFORE LAUNCH: set USE_DEMO_WINDOW = false. The featured session will then
 *    use FEATURED_STARTS_AT / FEATURED_CLOSES_AT below — plain ISO strings you
 *    control. That is the only change required to ship real dates.
 */
const USE_DEMO_WINDOW = true;

// Used only when USE_DEMO_WINDOW = false. Edit these to your real run.
const FEATURED_STARTS_AT = "2026-07-13T00:00:00.000Z";
const FEATURED_CLOSES_AT = "2026-07-19T23:59:59.000Z";

/**
 * Demo helper: current Monday→Sunday window (UTC) so the featured session is
 * always mid-run. Not used in production when USE_DEMO_WINDOW = false.
 */
function weeklyWindow(): { startsAt: string; closesAt: string } {
  const now = new Date();
  const day = now.getUTCDay(); // 0 Sun … 6 Sat
  const sinceMonday = (day + 6) % 7;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - sinceMonday);
  monday.setUTCHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 0);
  return { startsAt: monday.toISOString(), closesAt: sunday.toISOString() };
}

const featuredWindow = USE_DEMO_WINDOW
  ? weeklyWindow()
  : { startsAt: FEATURED_STARTS_AT, closesAt: FEATURED_CLOSES_AT };

export const observationSessions: ObservationSession[] = [
  {
    id: "observation-023",
    slug: "observation-023",
    observationNumber: "023",
    animalId: "animal-023",
    intro: "Take a moment before you decide what it is.",
    startsAt: featuredWindow.startsAt,
    closesAt: featuredWindow.closesAt,
    questionIds: ["q-see", "q-stands", "q-name"],
    allowPostCloseResponses: false,
    featured: true,
  },
  {
    id: "observation-022",
    slug: "observation-022",
    observationNumber: "022",
    animalId: "animal-022",
    startsAt: "2026-07-06T00:00:00.000Z",
    closesAt: "2026-07-12T23:59:59.000Z",
    resultFrozenAt: "2026-07-12T23:59:59.000Z",
    questionIds: ["q-see", "q-stands", "q-name"],
    allowPostCloseResponses: true,
    featured: false,
  },
  {
    id: "observation-021",
    slug: "observation-021",
    observationNumber: "021",
    animalId: "animal-021",
    startsAt: "2026-06-29T00:00:00.000Z",
    closesAt: "2026-07-05T23:59:59.000Z",
    resultFrozenAt: "2026-07-05T23:59:59.000Z",
    questionIds: ["q-see", "q-stands"],
    allowPostCloseResponses: false,
    featured: false,
  },
  {
    id: "observation-020",
    slug: "observation-020",
    observationNumber: "020",
    animalId: "animal-020",
    startsAt: "2026-06-22T00:00:00.000Z",
    closesAt: "2026-06-28T23:59:59.000Z",
    resultFrozenAt: "2026-06-28T23:59:59.000Z",
    questionIds: ["q-see", "q-name"],
    allowPostCloseResponses: false,
    featured: false,
  },
];

export function getSessionBySlug(slug: string): ObservationSession | undefined {
  return observationSessions.find((s) => s.slug === slug);
}

export function getSessionById(id: string): ObservationSession | undefined {
  return observationSessions.find((s) => s.id === id);
}
