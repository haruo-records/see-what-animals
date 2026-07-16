"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { AnimalReference, ObservationQuestion, ObservationSession } from "@/types";
import { getDictionary } from "@/locales";
import { siteSettings } from "@/data/site-settings";
import { observationService } from "@/lib/observation/observation-service";
import { trackEvent } from "@/lib/analytics";
import { SpecimenView } from "./specimen-view";
import { ObservationPrompt } from "./observation-prompt";
import { ChoiceList } from "./choice-list";
import { FreeTextNote } from "./free-text-note";
import { ObservationProgress } from "./observation-progress";
import { Button } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";

const dict = getDictionary("en");

type Phase = "questions" | "note";

/**
 * `/` IS the game. Left column: the framed work, always in place. Right column:
 * only this changes. There is no "start" screen and no begin button — looking at
 * the work already is the observation, so the first question is present at once.
 * Submitting navigates to the record at /observations/[slug].
 */
export function ObservationExperience({
  session,
  animal,
  questions,
  accepting,
}: {
  session: ObservationSession;
  animal: AnimalReference;
  questions: ObservationQuestion[];
  accepting: boolean;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("questions");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [alreadyObserved, setAlreadyObserved] = useState(false);

  const resultHref = `/observations/${session.slug}`;

  useEffect(() => {
    trackEvent({ event: "observation_view", observation_id: session.id, animal_id: animal.id });
    trackEvent({ event: "observation_start", observation_id: session.id, animal_id: animal.id });
    if (observationService.getResponse(session.id)) setAlreadyObserved(true);
  }, [session.id, animal.id]);

  const current = questions[index];
  const isLast = index === questions.length - 1;
  const currentValue = current ? (answers[current.id] ?? "") : "";
  const mustAnswerFirst = Boolean(current?.required) && currentValue.trim().length === 0;

  function answer(choiceId: string) {
    setAnswers((a) => ({ ...a, [current.id]: choiceId }));
    trackEvent({
      event: "observation_answer",
      observation_id: session.id,
      animal_id: animal.id,
      question_id: current.id,
      choice_id: choiceId,
    });
  }
  function setText(v: string) {
    setAnswers((a) => ({ ...a, [current.id]: v }));
  }
  function next() {
    if (isLast) setPhase("note");
    else setIndex((i) => i + 1);
  }
  function skip() {
    trackEvent({
      event: "observation_skip",
      observation_id: session.id,
      animal_id: animal.id,
      question_id: current.id,
    });
    next();
  }
  function back() {
    if (index > 0) setIndex((i) => i - 1);
  }
  function submit() {
    if (note.trim()) trackEvent({ event: "observation_note_submit", observation_id: session.id });
    observationService.submit({ sessionId: session.id, answers, note });
    trackEvent({ event: "observation_complete", observation_id: session.id, animal_id: animal.id });
    trackEvent({ event: "observation_result_view", observation_id: session.id });
    router.push(resultHref);
  }

  // ---- Right column ------------------------------------------------------
  let right: ReactNode;

  if (alreadyObserved) {
    right = (
      <div className="animate-rise-in">
        <p className="text-h3 font-normal text-charcoal">{dict.observe.already}</p>
        <div className="mt-10">
          <TextLink href={resultHref} className="text-caption uppercase tracking-[0.18em]">
            {dict.observe.viewResult}
          </TextLink>
        </div>
      </div>
    );
  } else if (!accepting) {
    right = (
      <div className="animate-rise-in">
        <p className="text-h3 font-normal text-charcoal">{dict.observe.closed}</p>
        <div className="mt-10">
          <TextLink href={resultHref} className="text-caption uppercase tracking-[0.18em]">
            {dict.observe.viewResult}
          </TextLink>
        </div>
      </div>
    );
  } else if (phase === "questions" && current) {
    right = (
      <div>
        <div className="mb-8 flex items-center justify-between">
          <ObservationProgress total={questions.length} current={index} />
          {index > 0 ? (
            <button
              onClick={back}
              className="text-caption uppercase tracking-[0.14em] text-charcoal hover:text-ink"
            >
              {dict.observe.back}
            </button>
          ) : (
            <span aria-hidden="true" />
          )}
        </div>

        <ObservationPrompt question={current} className="mb-8" />

        {current.type === "single-choice" ? (
          <ChoiceList question={current} value={answers[current.id]} onChange={answer} />
        ) : (
          <FreeTextNote
            label={current.question.en}
            value={answers[current.id] ?? ""}
            onChange={setText}
            maxLength={current.maxLength ?? 60}
          />
        )}

        <div className="mt-12 flex items-center justify-between">
          <button
            onClick={skip}
            className="text-caption uppercase tracking-[0.14em] text-charcoal hover:text-ink"
          >
            {dict.observe.skip}
          </button>
          <Button variant="quiet" onClick={next} disabled={mustAnswerFirst}>
            {isLast ? dict.observe.complete : dict.observe.next}
          </Button>
        </div>
        {mustAnswerFirst ? (
          <p className="mt-4 text-right text-caption text-muted">{dict.observe.requiredHint}</p>
        ) : null}
      </div>
    );
  } else if (phase === "note") {
    right = (
      <div>
        <FreeTextNote
          label={dict.observe.addNote}
          value={note}
          onChange={setNote}
          maxLength={siteSettings.noteMaxLength}
        />
        <div className="mt-12 flex items-center justify-between">
          <button
            onClick={() => setPhase("questions")}
            className="text-caption uppercase tracking-[0.14em] text-charcoal hover:text-ink"
          >
            {dict.observe.back}
          </button>
          <Button onClick={submit}>{dict.observe.seeOthers}</Button>
        </div>
      </div>
    );
  }

  // ---- Two-column shell --------------------------------------------------
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[55fr_45fr] lg:gap-24 lg:items-start">
      <div className="w-full">
        <div className="mx-auto w-full max-w-[600px] lg:mx-0">
          <SpecimenView animal={animal} priority size="stage" />
        </div>
      </div>

      <div className="w-full lg:pt-2">{right}</div>
    </div>
  );
}
