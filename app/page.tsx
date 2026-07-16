import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { observationSessions } from "@/data/observation-sessions";
import { getAnimalReference } from "@/data/animal-references";
import { getQuestion } from "@/data/questions";
import { isAcceptingResponses } from "@/lib/observation/session-status";
import { PageShell } from "@/components/layout/page-shell";
import { ObservationExperience } from "@/components/observation/observation-experience";

/**
 * `/` IS the current observation game. Opening the site starts the experience —
 * there is no separate Home or Play page to find.
 */
export const metadata: Metadata = {
  title: { absolute: "See What? — A game for looking before naming" },
  description:
    "Observe an unfamiliar form, share what you see, and discover how differently others saw it.",
};

export default function HomePage() {
  const session = observationSessions.find((s) => s.featured) ?? observationSessions[0];
  const animal = getAnimalReference(session.animalId);
  const questions = session.questionIds
    .map((id) => getQuestion(id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q));

  if (!animal) notFound();

  return (
    <section className="py-14 sm:py-20 lg:py-24">
      <PageShell width="shell">
        <ObservationExperience
          session={session}
          animal={animal}
          questions={questions}
          accepting={isAcceptingResponses(session)}
        />
      </PageShell>
    </section>
  );
}
