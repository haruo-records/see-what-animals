import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { observationSessions, getSessionBySlug } from "@/data/observation-sessions";
import { isPublic, publicSessions } from "@/lib/observation/publish";
import { getAnimalReference } from "@/data/animal-references";
import { siteSettings } from "@/data/site-settings";
import { formatDate } from "@/lib/observation/session-status";
import { PageShell } from "@/components/layout/page-shell";
import { ObservationResult } from "@/components/observation/observation-result";

export function generateStaticParams() {
  // Only published works get a pre-rendered page. A scheduled one has no URL
  // until its date arrives.
  return publicSessions(observationSessions).map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const session = getSessionBySlug(params.slug);
  if (!session || !isPublic(session)) return {};
  return {
    title: `Observation ${session.observationNumber}`,
    description: `What did people see this week — ${formatDate(session.startsAt)} to ${formatDate(
      session.closesAt,
    )}.`,
  };
}

export default function ObservationResultPage({ params }: { params: { slug: string } }) {
  const session = getSessionBySlug(params.slug);
  // A scheduled work is treated as not existing rather than as forbidden: the
  // fact that observation-031 is coming is not something to leak either.
  if (!session || !isPublic(session)) notFound();

  const animal = getAnimalReference(session.animalId);

  if (!animal) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Observation ${session.observationNumber}`,
    url: `${siteSettings.siteUrl}/observations/${session.slug}`,
    description: "What did people see this week.",
  };

  return (
    <section className="py-10 sm:py-14">
      <PageShell width="shell">
        <ObservationResult session={session} animal={animal} />
      </PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
