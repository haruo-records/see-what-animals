import type { AnimalReference, ObservationSession } from "@/types";
import { formatDate } from "@/lib/observation/session-status";
import { SpecimenPair } from "./specimen-pair";
import { toObservationPair } from "@/lib/observation/observation-pair";
import { WhatPeopleSaw } from "./what-people-saw";
import { ShareResult } from "./share-result";
import { Divider } from "@/components/ui/divider";
import { TextLink } from "@/components/ui/text-link";

/**
 * The record for one week. The same two-image observation unit as the entrance,
 * under a quiet "Spotted This Week"; below it, "What did people see?" — the week's
 * answers as a plain list — a spoiler-free share, the dates, and the way back.
 * Never a dashboard: no bars, no percentages, no scores.
 */
export function ObservationResult({
  session,
  animal,
  showSpecimen = true,
}: {
  session: ObservationSession;
  animal: AnimalReference;
  showSpecimen?: boolean;
}) {
  const pair = toObservationPair(animal);

  return (
    <div className="flex flex-col gap-9">
      <div className="mx-auto flex w-full max-w-work flex-col items-center gap-12">
        {showSpecimen ? (
          <div className="w-full">
            <p className="mb-6 text-center text-caption tracking-[0.12em] text-muted">
              Spotted This Week
            </p>
            <SpecimenPair pair={pair} />
          </div>
        ) : null}

        <div className="w-full max-w-reading">
          <WhatPeopleSaw animalId={animal.id} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-reading">
        <div className="mt-2">
          <ShareResult observationNumber={session.observationNumber} slug={session.slug} />
        </div>

        <Divider className="my-9" />

        <div className="flex flex-col gap-4">
          <p className="text-caption text-muted">
            Observation {session.observationNumber} · {formatDate(session.startsAt)} —{" "}
            {formatDate(session.closesAt)}
          </p>
          <TextLink href="/observations">Archive</TextLink>
        </div>
      </div>
    </div>
  );
}
