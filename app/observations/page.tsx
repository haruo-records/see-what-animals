import type { Metadata } from "next";
import { observationSessions } from "@/data/observation-sessions";
import { getAnimalReference } from "@/data/animal-references";
import { resultService } from "@/lib/observation/result-service";
import { deriveStatus } from "@/lib/observation/session-status";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { ObservationList } from "@/components/observations/observation-list";

export const metadata: Metadata = {
  title: "Past Observations",
  description: "Observations that have closed, and how each form was seen.",
};

export default function ObservationsPage() {
  const items = observationSessions
    .filter((s) => deriveStatus(s) === "closed")
    .sort((a, b) => new Date(b.closesAt).getTime() - new Date(a.closesAt).getTime())
    .map((session) => ({
      session,
      animal: getAnimalReference(session.animalId)!,
      responses: resultService.getResult(session.id)?.totalResponses,
    }));

  return (
    <section className="py-24">
      <PageShell width="work">
        <SectionHeading
          as="h1"
          eyebrow="The record so far"
          title="Past observations"
          className="mb-16"
        />
        <p className="mb-16 max-w-reading text-body-lg text-charcoal">
          These are not the works themselves — the works live in the animals archive. This is a
          register of how each form was seen during its week of observation.
        </p>
        <ObservationList items={items} />
      </PageShell>
    </section>
  );
}
