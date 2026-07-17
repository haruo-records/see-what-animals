"use client";

import { useEffect, useState } from "react";
import type { ChoiceResult, ObservationQuestion } from "@/types";
import { fetchResults } from "@/lib/collection/client";
import { observationService } from "@/lib/observation/observation-service";
import { ResultDistribution } from "./result-distribution";

/**
 * Renders the SAME ResultDistribution UI, but from real aggregated data
 * (/api/observations/results). The viewer's own choice is read from localStorage
 * to mark "— you". If there are no responses yet (or no backend configured), the
 * choices show at 0% — real, never invented numbers.
 */
export function LiveDistribution({
  question,
  sessionId,
}: {
  question: ObservationQuestion;
  sessionId: string;
}) {
  const [rows, setRows] = useState<ChoiceResult[] | null>(null);
  const [yourChoiceId, setYourChoiceId] = useState<string | undefined>(undefined);

  useEffect(() => {
    setYourChoiceId(observationService.getResponse(sessionId)?.answers[question.id]);
    let active = true;
    // eslint-disable-next-line no-console
    console.info("[see-what] result → GET /api/observations/results", {
      sessionId,
      questionId: question.id,
    });
    fetchResults(sessionId, question.id).then((res) => {
      if (!active) return;
      const mapped: ChoiceResult[] = (res?.global ?? []).map((g) => ({
        questionId: question.id,
        choiceId: g.answerId,
        count: g.count,
        percentage: g.percentage,
      }));
      setRows(mapped);
    });
    return () => {
      active = false;
    };
  }, [question.id, sessionId]);

  const display: ChoiceResult[] =
    rows && rows.length > 0
      ? rows
      : (question.choices ?? []).map((c) => ({
          questionId: question.id,
          choiceId: c.id,
          count: 0,
          percentage: 0,
        }));

  return <ResultDistribution question={question} results={display} yourChoiceId={yourChoiceId} />;
}
