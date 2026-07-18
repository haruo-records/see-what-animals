import type { Metadata } from "next";
import { observationSessions } from "@/data/observation-sessions";
import { getAnimalReference } from "@/data/animal-references";
import { resultService } from "@/lib/observation/result-service";
import { deriveStatus } from "@/lib/observation/session-status";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { ObservationList } from "@/components/observations/observation-list";

export const metadata: Metadata = {
  title: "Archive",
  description: "The record of past observations — each form, how it was seen, and the names it was given.",
};

/**
 * ARCHIVE — the record of observations. Here the *observation* is the subject:
 * the form, its answer distribution, the names it was given, and its dates. The
 * works themselves are kept in the animals archive; See What?'s Archive and
 * animals divide that role deliberately.
 */
export default function ArchivePage() {
  const items = observationSessions
    .filter((s) => deriveStatus(s) === "closed")
    .sort((a, b) => new Date(b.closesAt).getTime() - new Date(a.closesAt).getTime())
    .map((session) => ({
      session,
      animal: getAnimalReference(session.animalId)!,
      responses: resultService.getResult(session.id)?.totalResponses,
    }));

  return (
    <section className="py-12 sm:py-14">
      <PageShell width="work">
        <SectionHeading as="h1" eyebrow="The record of observations" title="Archive" className="mb-6" />
        <p className="mb-10 max-w-reading text-body-lg text-charcoal">
          A record of past observations. Each entry is an observation, not a work: the form, how it
          was seen, and the names it was given during its time open. The works themselves live in
          the animals archive.
        </p>
        <ObservationList items={items} />
      </PageShell>
    </section>
  );
}
