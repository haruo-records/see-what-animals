import Link from "next/link";
import type { ObservationSession, AnimalReference } from "@/types";
import { SpecimenView } from "@/components/observation/specimen-view";
import { formatDate } from "@/lib/observation/session-status";

/**
 * A past observation, as a line in a quiet register: the work, what it was seen
 * as (its description), and when it closed. No number, no counts — those are
 * management data. Opening it leads to the record, never a work-detail page.
 */
export function ObservationListItem({
  session,
  animal,
}: {
  session: ObservationSession;
  animal: AnimalReference;
  responses?: number;
}) {
  return (
    <Link
      href={`/observations/${session.slug}`}
      className="group grid grid-cols-[80px_1fr] items-center gap-6 border-t border-stone py-8 first:border-t-0 sm:grid-cols-[120px_1fr_auto]"
    >
      <div className="w-full">
        <SpecimenView animal={animal} size="card" />
      </div>
      <div>
        <p className="text-body-lg text-ink transition-colors group-hover:text-charcoal">
          {animal.alt}
        </p>
      </div>
      <div className="hidden text-right sm:block">
        <p className="text-caption text-muted">Closed {formatDate(session.closesAt)}</p>
      </div>
    </Link>
  );
}
