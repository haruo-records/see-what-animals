import type {
  AnimalReference,
  ObservationQuestion,
  ObservationResult as ResultData,
  ObservationSession,
} from "@/types";
import { getDictionary } from "@/locales";
import { formatDate } from "@/lib/observation/session-status";
import { LiveDistribution } from "./live-distribution";
import { ArchiveLink } from "./archive-link";
import { SpecimenView } from "./specimen-view";
import { Divider } from "@/components/ui/divider";
import { TextLink } from "@/components/ui/text-link";

const dict = getDictionary("en");

/**
 * The record for one observation, in the same shape as the game: left, the work;
 * right, what you saw and how the form was seen. Below, in a quiet reading column,
 * the minority acknowledgement, the names, a few notes, and the way back. Never a
 * dashboard — hairline bars, kept minorities, prose.
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

  const distributions = questions
    .filter((q) => q.type === "single-choice")
    .map((q) => <LiveDistribution key={q.id} question={q} sessionId={session.id} />);

  return (
    <div className="flex flex-col gap-16">
      {/* Top — same two columns as the game */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[55fr_45fr] lg:gap-24 lg:items-start">
        <div className="w-full">
          {showSpecimen ? (
            <div className="mx-auto w-full max-w-[600px] lg:mx-0">
              <SpecimenView animal={animal} size="stage" />
            </div>
          ) : null}
        </div>

        <div className="w-full lg:pt-2">
          {yourLabel ? (
            <div className="mb-12">
              <p className="u-label mb-3">{dict.result.youSaw}</p>
              <p className="text-h2 font-normal text-ink">{yourLabel}</p>
            </div>
          ) : null}
          <div className="flex flex-col gap-12">{distributions}</div>
        </div>
      </div>

      {/* Below — a quiet reading column */}
      <div className="mx-auto w-full max-w-reading">
        <p className="text-body-lg text-charcoal">{dict.result.someoneDiff}</p>

        {result.offeredNames && result.offeredNames.length > 0 ? (
          <div className="mt-12">
            <p className="u-label mb-4">{dict.result.names}</p>
            <p className="text-h3 font-normal text-charcoal">{result.offeredNames.join("  ·  ")}</p>
          </div>
        ) : null}

        {result.selectedNotes && result.selectedNotes.length > 0 ? (
          <div className="mt-12">
            <p className="u-label mb-4">{dict.result.notes}</p>
            <ul className="flex flex-col gap-4">
              {result.selectedNotes.map((n) => (
                <li key={n.id} className="text-body-lg text-charcoal" lang={n.language}>
                  “{n.text}”
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <Divider className="my-12" />

        <div className="flex flex-col gap-6">
          <p className="text-caption text-muted">
            {formatDate(session.startsAt)} — {formatDate(session.closesAt)}
          </p>
          <ArchiveLink animal={animal} observationId={session.id} />
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-8">
            <TextLink href="/observations">{dict.result.past}</TextLink>
            <TextLink href="/field-notes">{dict.result.fieldNotes}</TextLink>
          </div>
        </div>
      </div>
    </div>
  );
}
