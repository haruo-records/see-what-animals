"use client";

import { useEffect, useState } from "react";
import { fetchResults } from "@/lib/collection/client";
import { observationService } from "@/lib/observation/observation-service";
import { siteSettings } from "@/data/site-settings";

/**
 * SPOILER-FREE SHARE (learned from Wordle). The work image is never shared — only
 * a small text card that makes someone want to look for themselves:
 *
 *   See What?
 *   Observation #014
 *   18% saw what I saw.
 *   What do you see?
 *   <link>
 *
 * The "% saw what I saw" line uses the viewer's own first answer (from
 * localStorage) against the live distribution. If they haven't answered (or no
 * data yet), that line is simply omitted — never invented.
 */
export function ShareResult({
  observationNumber,
  slug,
  sessionId,
  questionId,
}: {
  observationNumber: string;
  slug: string;
  sessionId: string;
  questionId?: string;
}) {
  const [pct, setPct] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "copied" | "shared">("idle");

  useEffect(() => {
    if (!questionId) return;
    const your = observationService.getResponse(sessionId)?.answers[questionId];
    if (!your) return;
    let active = true;
    fetchResults(sessionId, questionId).then((res) => {
      if (!active) return;
      const row = (res?.global ?? []).find((g) => g.answerId === your);
      if (row) setPct(row.percentage);
    });
    return () => {
      active = false;
    };
  }, [sessionId, questionId]);

  function buildText(): string {
    const base = siteSettings.siteUrl.replace(/\/$/, "");
    const lines = [
      "See What?",
      `Observation #${observationNumber}`,
      pct != null ? `${pct}% saw what I saw.` : null,
      "What do you see?",
      `${base}/observations/${slug}`,
    ].filter((l): l is string => Boolean(l));
    return lines.join("\n");
  }

  async function onShare() {
    const text = buildText();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text });
        setStatus("shared");
        return;
      } catch {
        /* cancelled or unsupported — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 2400);
    } catch {
      /* clipboard blocked — nothing else to do quietly */
    }
  }

  return (
    <div>
      <button
        onClick={onShare}
        className="inline-flex min-h-[48px] items-center gap-2 rounded-sm border border-stone px-6 py-3 text-caption uppercase tracking-[0.14em] text-charcoal transition-colors duration-micro hover:border-charcoal hover:text-ink"
      >
        {status === "copied" ? "Copied" : status === "shared" ? "Shared" : "Share"}
      </button>
      <p className="mt-3 text-caption text-muted" aria-live="polite">
        A spoiler-free note — the form itself is never shared.
      </p>
    </div>
  );
}
