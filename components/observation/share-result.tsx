"use client";

import { useState } from "react";
import { siteSettings } from "@/data/site-settings";

/**
 * SPOILER-FREE SHARE. The work image is never shared — only a small text card
 * that makes someone want to look for themselves:
 *
 *   See What?
 *   Spotted this week
 *   What do you see?
 *   <link>
 *
 * No answer, no numbers — nothing that pre-loads how to see it.
 */
export function ShareResult({
  observationNumber,
  slug,
}: {
  observationNumber: string;
  slug: string;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "shared">("idle");

  function buildText(): string {
    const base = siteSettings.siteUrl.replace(/\/$/, "");
    return [
      "See What?",
      "Spotted this week",
      "What do you see?",
      `${base}/observations/${slug}`,
    ].join("\n");
  }

  async function onShare() {
    const text = buildText();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text });
        setStatus("shared");
        return;
      } catch {
        /* cancelled — fall through to copy */
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
