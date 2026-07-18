import type { ObservationSession, SessionStatus } from "@/types";

/**
 * Derives scheduled | open | closed from the clock. A single shared function so
 * every screen agrees. An explicit session.status overrides derivation.
 */
export function deriveStatus(session: ObservationSession, now: Date = new Date()): SessionStatus {
  if (session.status) return session.status;
  const start = new Date(session.startsAt).getTime();
  const close = new Date(session.closesAt).getTime();
  const t = now.getTime();
  if (t < start) return "scheduled";
  if (t > close) return "closed";
  return "open";
}

export function isAcceptingResponses(session: ObservationSession, now: Date = new Date()): boolean {
  const status = deriveStatus(session, now);
  if (status === "open") return true;
  if (status === "closed" && session.allowPostCloseResponses) return true;
  return false;
}

/**
 * A calm remaining-time phrase. No seconds, no FOMO.
 * Returns e.g. "6 days remaining", "Closes Sunday", "Ends today".
 */
export function remainingLabel(
  session: ObservationSession,
  now: Date = new Date(),
): string | null {
  const status = deriveStatus(session, now);
  if (status === "closed") return null;

  const close = new Date(session.closesAt);
  const msLeft = close.getTime() - now.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const daysLeft = Math.ceil(msLeft / dayMs);

  if (status === "scheduled") return "Opening soon";
  if (daysLeft <= 0) return "Ends today";
  if (daysLeft === 1) return "Ends tomorrow";
  return `${daysLeft} days remaining`;
}

/** Long-form date, e.g. "14 July 2026". */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
