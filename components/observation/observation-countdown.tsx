import type { ObservationSession } from "@/types";
import { remainingLabel } from "@/lib/observation/session-status";

/** Calm remaining-time line. No seconds. No urgency. */
export function ObservationCountdown({
  session,
  className = "",
}: {
  session: ObservationSession;
  className?: string;
}) {
  const label = remainingLabel(session);
  if (!label) return null;
  return <span className={`text-caption text-muted ${className}`}>{label}</span>;
}
