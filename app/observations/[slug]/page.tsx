import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { observationSessions, getSessionBySlug } from "@/data/observation-sessions";
import { getAnimalReference } from "@/data/animal-references";
import { getQuestion } from "@/data/questions";
import { resultService } from "@/lib/observation/result-service";
import { siteSettings } from "@/data/site-settings";
import { formatDate } from "@/lib/observation/session-status";
import { PageShell } from "@/components/layout/page-shell";
import { ObservationResult } from "@/components/observation/observation-result";

export function generateStaticParams() {
  return observationSessions.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const session = getSessionBySlug(params.slug);
  if (!session) return {};
  const result = resultService.getResult(session.id);
  return {
    title: `Observation ${session.observationNumber}`,
    description: `How one form was seen. ${result?.totalResponses ?? 0} observations, ${formatDate(
      session.startsAt,
    )} – ${formatDate(session.closesAt)}.`,
  };
}

export default function ObservationResultPage({ params }: { params: { slug: string } }) {
  const session = getSessionBySlug(params.slug);
  if (!session) notFound();

  const animal = getAnimalReference(session.animalId);
  const result = resultService.getResult(session.id);
  const questions = session.questionIds
    .map((id) => getQuestion(id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q));

  if (!animal || !result) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Observation ${session.observationNumber}`,
    url: `${siteSettings.siteUrl}/observations/${session.slug}`,
    description: `An observation record. ${result.totalResponses} responses.`,
  };

  return (
    <section className="py-10 sm:py-14">
      <PageShell width="shell">
        <ObservationResult
          session={session}
          animal={animal}
          result={result}
          questions={questions}
        />
      </PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
