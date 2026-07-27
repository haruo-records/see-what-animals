"use client";

import { useEffect } from "react";
import { sendGaEvent } from "@/lib/gtag";

/**
 * NAVIGATION ANALYTICS — one delegated listener for the whole site.
 *
 * Mounted once in the root layout, this attaches a SINGLE `click` listener to
 * `document`. Every <a> click bubbles to it, so links never carry their own
 * onClick handler — new links (and future pages) are measured automatically,
 * with no per-link wiring. It emits a GA4 `navigation_click` event via gtag.js.
 *
 * WHERE a link sits (`link_area`) is read from the nearest ancestor carrying a
 * `data-analytics-area` attribute — set once on the header, footer and side
 * menu containers. Nothing is hardcoded per link.
 *
 * EXTENDING beyond <a> (Share buttons, CTAs, result-page controls): give the
 * element `data-analytics-track` and, optionally:
 *   data-analytics-event="share_click"     // event name (default navigation_click)
 *   data-analytics-label="Share this"       // link_text override
 *   data-analytics-url="/observations/023"  // link_url override
 *   data-analytics-area="result"            // or set it on a wrapping element
 * The same central handler picks it up — no new listeners, no new onClick.
 *
 * Guarantees:
 *   - one listener → one event per click (no double-send),
 *   - it only reads the event; it never calls preventDefault / stopPropagation,
 *     so existing link and drawer behaviour is untouched,
 *   - passive + a cheap `closest()` lookup → no measurable cost,
 *   - if gtag hasn't loaded, `sendGaEvent` is a no-op.
 */
export function NavigationAnalytics() {
  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      const start = event.target as Element | null;
      if (!start || typeof start.closest !== "function") return;

      // Anchors are tracked automatically; other elements opt in explicitly.
      const el = start.closest<HTMLElement>("a[href], [data-analytics-track]");
      if (!el) return;

      const resolved = describeClick(el);
      if (!resolved) return;

      sendGaEvent(resolved.eventName, resolved.params);
    }

    document.addEventListener("click", onDocumentClick, { passive: true });
    return () => document.removeEventListener("click", onDocumentClick);
  }, []);

  return null;
}

type ResolvedClick = {
  eventName: string;
  params: {
    link_text: string;
    link_url: string;
    link_type: "internal" | "external";
    link_area: string;
  };
};

/**
 * Turn a clicked element into a GA4 event payload — or null when it isn't
 * worth recording (empty href, in-page `#anchor`, unresolvable). Pure and
 * DOM-only, so it's easy to reason about and reuse.
 */
function describeClick(el: HTMLElement): ResolvedClick | null {
  const isAnchor = el.tagName === "A";

  const rawUrl =
    el.getAttribute("data-analytics-url") ??
    (isAnchor ? el.getAttribute("href") : null) ??
    "";

  // Skip non-navigation anchors: empty and in-page (#…) hrefs.
  if (isAnchor && (rawUrl === "" || rawUrl.startsWith("#"))) return null;

  return {
    eventName: el.getAttribute("data-analytics-event") ?? "navigation_click",
    params: {
      link_text: readLinkText(el),
      link_url: rawUrl,
      link_type: readLinkType(el, isAnchor),
      link_area: readLinkArea(el),
    },
  };
}

function readLinkText(el: HTMLElement): string {
  const explicit = el.getAttribute("data-analytics-label");
  if (explicit) return explicit.trim().slice(0, 100);

  // Collapse whitespace and drop the quiet external "↗" marker.
  const text = (el.textContent ?? "").replace(/↗/g, "").replace(/\s+/g, " ").trim();
  if (text) return text.slice(0, 100);

  const aria = el.getAttribute("aria-label");
  return aria ? aria.trim().slice(0, 100) : "";
}

function readLinkType(el: HTMLElement, isAnchor: boolean): "internal" | "external" {
  const override = el.getAttribute("data-analytics-type");
  if (override === "internal" || override === "external") return override;
  if (!isAnchor) return "internal";

  try {
    // `el.href` (the anchor DOM property) is always resolved to an absolute URL.
    const url = new URL((el as HTMLAnchorElement).href, window.location.href);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "external";
    return url.origin === window.location.origin ? "internal" : "external";
  } catch {
    return "external";
  }
}

function readLinkArea(el: HTMLElement): string {
  const zone = el.closest<HTMLElement>("[data-analytics-area]");
  return zone?.getAttribute("data-analytics-area") ?? "unknown";
}
