"use client";

import { useEffect, useState } from "react";
import { fetchResponseSummary, type ResponseCount } from "@/lib/response/client";

/**
 * WHAT DID PEOPLE SEE? — the week's answers, read as a quiet list rather than a
 * ranking. Each line is a word or phrase someone left, with a plain count in
 * parentheses. No rank numbers, no bars, no percentages, no medals — just what
 * people saw, most-said first so the page reads naturally top to bottom.
 *
 * Grouping is decided server-side (/api/responses/summary); this only renders
 * what it returns, so the display is unchanged when exact-match becomes AI
 * clustering.
 */
export function WhatPeopleSaw({ animalId }: { animalId: string }) {
  const [rows, setRows] = useState<ResponseCount[] | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetchResponseSummary(animalId).then((res) => {
      if (!active) return;
      setRows(res?.responses ?? []);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [animalId]);

  return (
    <div>
      <h2 className="text-h3 font-normal text-charcoal mb-6">What did people see?</h2>

      {!loaded ? (
        <p className="text-body-lg text-muted">Gathering…</p>
      ) : rows && rows.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {rows.map((r) => (
            <li key={r.text} className="text-body-lg text-ink">
              <span className="first-letter:uppercase">{r.text}</span>{" "}
              <span className="text-muted">({r.count})</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body-lg text-muted">No observations yet.</p>
      )}
    </div>
  );
}
