"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { AnimalReference, ObservationQuestion, ObservationSession } from "@/types";
import { getDictionary } from "@/locales";
import { observationService } from "@/lib/observation/observation-service";
import { trackEvent } from "@/lib/analytics";
import { submitObservations, captureFirstTouchUtm } from "@/lib/collection/client";
import { submitWord } from "@/lib/naming/client";
import { validateWord } from "@/lib/naming/word";
import { GAME_VERSION } from "@/lib/collection/config";
import { SpecimenView } from "./specimen-view";
import { ObservationPrompt } from "./observation-prompt";
import { ChoiceList } from "./choice-list";
import { WordInput } from "./word-input";
import { AnimalName } from "./animal-name";
import { ObservationProgress } from "./observation-progress";
import { Button } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";

const dict = getDictionary("en");

/**
 * `/` IS the observation. Left column: the framed work, always in place. Right column:
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
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [alreadyObserved, setAlreadyObserved] = useState(false);
  const submittedRef = useRef(false);

  const resultHref = `/observations/${session.slug}`;

  useEffect(() => {
    trackEvent({ event: "observation_view", observation_id: session.id, animal_id: animal.id });
    trackEvent({ event: "observation_start", observation_id: session.id, animal_id: animal.id });
    captureFirstTouchUtm(); // record first-touch UTM even if they leave before submitting
    if (observationService.getResponse(session.id)) setAlreadyObserved(true);
  }, [session.id, animal.id]);

  const current = questions[index];
  const isLast = index === questions.length - 1;
  const currentValue = current ? (answers[current.id] ?? "") : "";
  const mustAnswerFirst = Boolean(current?.required) && currentValue.trim().length === 0;
  const wordInvalid =
    current?.type === "word" &&
    currentValue.trim().length > 0 &&
    !validateWord(currentValue).ok;

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
    if (isLast) void submit();
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
  async function submit() {
    if (submittedRef.current) return; // guard double-click / re-entry
    submittedRef.current = true;

    // Collect the single-choice answers actually given (free-text is not counted).
    const collected = questions
      .filter((q) => q.type === "single-choice" && (answers[q.id] ?? "").length > 0)
      .map((q) => ({
        questionId: q.id,
        answerId: answers[q.id],
        questionVersion: q.version ?? "1",
      }));

    // eslint-disable-next-line no-console
    console.info("[see-what] submit()", { answers, collected });

    if (collected.length === 0) {
      // Nothing to store (all questions skipped). Don't POST; still let the
      // person see the record. Logged so an unexpected empty is visible.
      // eslint-disable-next-line no-console
      console.error("[see-what] No single-choice answers collected — nothing to POST", {
        answers,
        questions,
      });
    } else {
      // GA4 (behaviour) — one event per answer. No session id / PII sent.
      collected.forEach((a) =>
        trackEvent({
          event: "see_what_answer",
          question_id: a.questionId,
          answer_id: a.answerId,
          game_version: GAME_VERSION,
          question_version: a.questionVersion,
        }),
      );
      try {
        // AWAIT so the POST is actually sent and completed before we navigate.
        await submitObservations(session.id, collected);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[see-what] submitObservations failed", error);
      }
    }

    // The one word (Q3) — validated again here; saved for AI naming.
    const wordQuestion = questions.find((q) => q.type === "word");
    const wordRaw = wordQuestion ? (answers[wordQuestion.id] ?? "").trim() : "";
    const wordCheck = wordRaw ? validateWord(wordRaw) : null;
    if (wordCheck && wordCheck.ok) {
      try {
        await submitWord(animal.id, wordCheck.word);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[see-what] submitWord failed", error);
      }
    }

    // Mark as observed locally AFTER the save attempts.
    observationService.submit({ sessionId: session.id, answers, note: "" });
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
  } else if (current) {
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
          <WordInput value={answers[current.id] ?? ""} onChange={setText} />
        )}

        <div className="mt-12 flex items-center justify-between">
          <button
            onClick={skip}
            className="text-caption uppercase tracking-[0.14em] text-charcoal hover:text-ink"
          >
            {dict.observe.skip}
          </button>
          <Button variant="quiet" onClick={next} disabled={mustAnswerFirst || wordInvalid}>
            {isLast ? dict.observe.seeOthers : dict.observe.next}
          </Button>
        </div>
        {mustAnswerFirst ? (
          <p className="mt-4 text-right text-caption text-muted">{dict.observe.requiredHint}</p>
        ) : null}
      </div>
    );
  }

  // ---- Two-column shell --------------------------------------------------
  return (
    <div className="grid grid-cols-1 gap-9 lg:grid-cols-[55fr_45fr] lg:gap-24 lg:items-start">
      <div className="w-full">
        <div className="mx-auto w-full max-w-[600px] lg:mx-0">
          <SpecimenView animal={animal} priority size="stage" />
        </div>
        <div className="mt-6 text-center lg:text-left">
          <AnimalName animalId={animal.id} />
        </div>
      </div>

      <div className="w-full lg:pt-2">{right}</div>
    </div>
  );
}
