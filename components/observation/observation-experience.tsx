"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { AnimalReference, ObservationQuestion, ObservationSession } from "@/types";
import { getDictionary } from "@/locales";
import { observationService } from "@/lib/observation/observation-service";
import { trackEvent } from "@/lib/analytics";
import { captureFirstTouchUtm } from "@/lib/collection/client";
import { submitResponse } from "@/lib/response/client";
import { validateResponse } from "@/lib/response/response";
import { SpecimenPair } from "./specimen-pair";
import { toObservationPair } from "@/lib/observation/observation-pair";
import { ObservationPrompt } from "./observation-prompt";
import { ResponseInput } from "./response-input";
import { WhatPeopleSaw } from "./what-people-saw";
import { Button } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";

const dict = getDictionary("en");

/**
 * `/` IS the observation. "Spotted This Week" sits above the two framed images;
 * below them, one open question — "What do you see?" — free text, no choices, no
 * steps. Looking at the work already is the observation.
 *
 * The answer is saved to Supabase and kept in the browser's local response
 * record, and feeds "What did people see?". If the save fails, nothing is
 * recorded and the person can try again — the input is kept and a short error is
 * shown. Once the week is switched to results (status "closed"), the form is
 * gone and the results stand in its place.
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
  const pair = toObservationPair(animal);
  const seeQ: ObservationQuestion | undefined =
    questions.find((q) => q.id === "q-see") ?? questions[0];

  const [see, setSee] = useState("");
  const [alreadyObserved, setAlreadyObserved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const submittedRef = useRef(false);

  const resultHref = `/observations/${session.slug}`;

  useEffect(() => {
    trackEvent({ event: "observation_view", observation_id: session.id, animal_id: animal.id });
    trackEvent({ event: "observation_start", observation_id: session.id, animal_id: animal.id });
    captureFirstTouchUtm();
    if (observationService.getResponse(session.id)) setAlreadyObserved(true);
  }, [session.id, animal.id]);

  const seeCheck = see.trim() ? validateResponse(see) : null;
  const canSubmit = Boolean(seeCheck?.ok);

  async function submit() {
    if (submittedRef.current) return;
    const seeVerdict = validateResponse(see);
    if (!seeVerdict.ok) return;
    submittedRef.current = true;
    setSaveError(false);

    if (seeQ) {
      trackEvent({
        event: "observation_answer",
        observation_id: session.id,
        animal_id: animal.id,
        question_id: seeQ.id,
      });
    }

    // If the answer does not save, record nothing and let the person try again —
    // keep their input and re-enable the button.
    const saved = await submitResponse(animal.id, seeVerdict.text);
    if (!saved) {
      setSaveError(true);
      submittedRef.current = false;
      return;
    }

    observationService.submit({
      sessionId: session.id,
      answers: seeQ ? { [seeQ.id]: seeVerdict.text } : {},
      note: "",
    });
    trackEvent({ event: "observation_complete", observation_id: session.id, animal_id: animal.id });
    trackEvent({ event: "observation_result_view", observation_id: session.id });
    router.push(resultHref);
  }

  // ---- What sits below the work -----------------------------------------
  let below: ReactNode;

  if (!accepting) {
    below = (
      <div className="animate-rise-in">
        <WhatPeopleSaw animalId={animal.id} />
        <p className="mt-8 text-caption text-muted">Answers are closed for this week.</p>
      </div>
    );
  } else if (alreadyObserved) {
    below = (
      <div className="animate-rise-in">
        <p className="text-h3 font-normal text-charcoal">{dict.observe.already}</p>
        <div className="mt-8">
          <TextLink href={resultHref} className="text-caption uppercase tracking-[0.18em]">
            {dict.observe.viewResult}
          </TextLink>
        </div>
      </div>
    );
  } else if (seeQ) {
    below = (
      <div>
        <ObservationPrompt question={seeQ} className="mb-8" />
        <ResponseInput value={see} onChange={setSee} onEnter={submit} ariaLabel={seeQ.question} />
        <div className="mt-12 flex flex-col items-end gap-3">
          {saveError ? (
            <p className="text-caption text-clay" role="alert" aria-live="polite">
              Couldn&apos;t save your answer. Please try again.
            </p>
          ) : null}
          <Button variant="quiet" onClick={submit} disabled={!canSubmit}>
            {dict.observe.seeOthers}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-work flex-col items-center gap-12 lg:gap-16">
      <div className="w-full">
        <p className="mb-6 text-center text-caption tracking-[0.12em] text-muted">
          Spotted This Week
        </p>
        <SpecimenPair pair={pair} priority />
      </div>

      <div className="w-full max-w-reading">{below}</div>
    </div>
  );
}
