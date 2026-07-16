import type { ObservationSession } from "@/types";
import { deriveStatus } from "@/lib/observation/session-status";

const labels: Record<string, string> = {
  scheduled: "Opening soon",
  open: "Open for observation",
  closed: "Observation closed",
};

/** A small state marker; a dot plus words (never colour alone). */
export function ObservationStatus({ session }: { session: ObservationSession }) {
  const status = deriveStatus(session);
  const dot =
    status === "open" ? "bg-moss" : status === "scheduled" ? "bg-sand" : "bg-stone";
  return (
    <span className="inline-flex items-center gap-2 text-caption text-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {labels[status]}
    </span>
  );
}
