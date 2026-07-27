/**
 * gtag — the single, typed door to GA4 events (gtag.js, not GTM).
 *
 * Components and the global click listener never touch `window.gtag` directly;
 * they call `sendGaEvent`. If the Google tag hasn't loaded (SSR, dev without an
 * id, an ad-blocker), this is a silent no-op — callers never have to guard.
 *
 * The gtag.js tag itself is loaded once in the root layout by
 * `components/analytics/google-analytics.tsx`. `window.gtag` is declared in
 * `lib/analytics.ts`.
 */

/** GA4 event parameters we send. Values stay flat (string / number / boolean). */
export type GaEventParams = Record<string, string | number | boolean | undefined>;

export function sendGaEvent(eventName: string, params: GaEventParams = {}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  // Drop undefined so GA4 never records an empty parameter.
  const clean: GaEventParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) clean[key] = value;
  }

  window.gtag("event", eventName, clean);
}
