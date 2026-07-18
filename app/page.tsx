import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteSettings } from "@/data/site-settings";
import { observationSessions } from "@/data/observation-sessions";
import { publicSessions } from "@/lib/observation/publish";
import { getAnimalReference } from "@/data/animal-references";
import { getQuestion } from "@/data/questions";
import { isAcceptingResponses } from "@/lib/observation/session-status";
import { PageShell } from "@/components/layout/page-shell";
import { ObservationExperience } from "@/components/observation/observation-experience";

/**
 * `/` IS the current observation. Opening the site starts the experience —
 * there is no separate Home or Play page to find.
 */
export const metadata: Metadata = {
  title: { absolute: `${siteSettings.brandName} — ${siteSettings.tagline}` },
  description:
    "Observe an unfamiliar form, leave what you saw, and discover how differently others saw it.",
};

export default function HomePage() {
  // A work registered for a future date must not become the home page early,
  // even if it was marked featured when it was registered.
  const live = publicSessions(observationSessions);
  const session = live.find((s) => s.featured) ?? live[0] ?? observationSessions[0];
  const animal = getAnimalReference(session.animalId);
  const questions = session.questionIds
    .map((id) => getQuestion(id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q));

  if (!animal) notFound();

  return (
    <section className="py-8 sm:py-10 lg:py-12">
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
