import type {
  AnimalReference,
  ObservationQuestion,
  ObservationResult as ResultData,
  ObservationSession,
} from "@/types";
import { getDictionary } from "@/locales";
import { formatDate } from "@/lib/observation/session-status";
import { LiveDistribution } from "./live-distribution";
import { SpecimenView } from "./specimen-view";
import { ShareResult } from "./share-result";
import { Divider } from "@/components/ui/divider";
import { TextLink } from "@/components/ui/text-link";

const dict = getDictionary("en");

/**
 * The record for one observation, in the same shape as the observation screen: left, the work;
 * right, what you saw and how the form was seen. Below, in a quiet reading column,
 * the minority acknowledgement, a spoiler-free share, the names, a few notes, and
 * the way back. Never a dashboard — hairline bars, kept minorities, prose.
 */
export function ObservationResult({
  session,
  animal,
  result,
  questions,
  yourAnswers,
  showSpecimen = true,
}: {
  session: ObservationSession;
  animal: AnimalReference;
  result: ResultData;
  questions: ObservationQuestion[];
  yourAnswers?: Record<string, string>;
  showSpecimen?: boolean;
}) {
  const primaryQuestion = questions.find((q) => q.type === "single-choice");
  const yourPrimary = primaryQuestion && yourAnswers ? yourAnswers[primaryQuestion.id] : undefined;
  const yourLabel = primaryQuestion?.choices?.find((c) => c.id === yourPrimary)?.label;

  const names = result.offeredNames ?? [];
  const notes = result.selectedNotes ?? [];

  const distributions = questions
    .filter((q) => q.type === "single-choice")
    .map((q) => <LiveDistribution key={q.id} question={q} sessionId={session.id} />);

  return (
    <div className="flex flex-col gap-9">
      {/* Top — same two columns as the observation screen */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[55fr_45fr] lg:gap-24 lg:items-start">
        <div className="w-full">
          {showSpecimen ? (
            <div className="mx-auto w-full max-w-[600px] lg:mx-0">
              <SpecimenView animal={animal} size="stage" />
            </div>
          ) : null}
        </div>

        <div className="w-full lg:pt-2">
          <p className="u-label mb-6">Observation {session.observationNumber}</p>
          {yourLabel ? (
            <div className="mb-10">
              <p className="u-label mb-3">{dict.result.youSaw}</p>
              <p className="text-h2 font-normal text-ink">{yourLabel}</p>
            </div>
          ) : null}
          <div className="flex flex-col gap-10">{distributions}</div>
        </div>
      </div>

      {/* Below — a quiet reading column */}
      <div className="mx-auto w-full max-w-reading">
        <p className="text-body-lg text-charcoal">{dict.result.someoneDiff}</p>

        <div className="mt-8">
          <ShareResult
            observationNumber={session.observationNumber}
            slug={session.slug}
            sessionId={session.id}
            questionId={primaryQuestion?.id}
          />
        </div>

        {/* Names and notes are things real observers left. They are never
            invented for display: when none exist, the section says so plainly
            rather than showing a plausible-looking example. */}
        <div className="mt-9">
          <p className="u-label mb-4">{dict.result.names}</p>
          {names.length > 0 ? (
            <p className="text-h3 font-normal text-charcoal">{names.join("  ·  ")}</p>
          ) : (
            <p className="text-body-lg text-muted">{dict.result.noNames}</p>
          )}
        </div>

        <div className="mt-9">
          <p className="u-label mb-4">{dict.result.notes}</p>
          {notes.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {notes.map((n) => (
                <li key={n.id} className="text-body-lg text-charcoal" lang={n.language}>
                  “{n.text}”
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body-lg text-muted">{dict.result.noNotes}</p>
          )}
        </div>

        <Divider className="my-9" />

        {/* The animals archive is reached from the footer only — one entrance,
            not one per page. ArchiveLink stays in the codebase (with its
            animals_archive_click event) for when a work-level bridge is wanted
            again. Field Notes is likewise out of the UI but still routed. */}
        <div className="flex flex-col gap-4">
          <p className="text-caption text-muted">
            {formatDate(session.startsAt)} — {formatDate(session.closesAt)}
          </p>
          <TextLink href="/observations">{dict.result.past}</TextLink>
        </div>
      </div>
    </div>
  );
}
