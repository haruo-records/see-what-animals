"use client";

import type { AnimalReference } from "@/types";
import { ExternalLink } from "@/components/ui/external-link";
import { getDictionary } from "@/locales";
import { trackEvent } from "@/lib/analytics";

const dict = getDictionary("en");

/**
 * The one bridge to the animals archive. See What? holds no work detail; this is
 * how a form returns to where it lives. Emits animals_archive_click.
 */
export function ArchiveLink({
  animal,
  observationId,
  label,
}: {
  animal: AnimalReference;
  observationId: string;
  label?: string;
}) {
  return (
    <ExternalLink
      href={animal.archiveUrl}
      note={dict.archive.external}
      onClick={() =>
        trackEvent({
          event: "animals_archive_click",
          observation_id: observationId,
          animal_id: animal.id,
          archive_url: animal.archiveUrl,
        })
      }
    >
      {label ?? dict.archive.view}
    </ExternalLink>
  );
}
