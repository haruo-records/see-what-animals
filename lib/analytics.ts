/**
 * analytics — one function. Components never push to dataLayer directly.
 * GA4 / GTM are wired via NEXT_PUBLIC_GA_MEASUREMENT_ID / NEXT_PUBLIC_GTM_ID.
 * With no id set, events are no-ops (dev-safe). Add the GTM/GA <Script> in
 * app/layout.tsx when ready — see README.
 */
import { siteSettings } from "@/data/site-settings";

export type AnalyticsEvent =
  | "observation_view"
  | "observation_start"
  | "observation_answer"
  | "observation_skip"
  | "observation_note_submit"
  | "observation_complete"
  | "observation_result_view"
  | "animals_archive_click"
  | "field_note_view"
  | "product_view"
  | "shop_click"
  | "newsletter_click"
  | "contact_click";

type Payload = Record<string, string | number | boolean | undefined> & {
  event: AnalyticsEvent;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function trackEvent(payload: Payload): void {
  if (typeof window === "undefined") return;
  const enabled = Boolean(siteSettings.gaMeasurementId || siteSettings.gtmId);
  if (!enabled) {
    if (process.env.NODE_ENV === "development") {
      // Visible in dev without a tag manager, silent in production.
      // eslint-disable-next-line no-console
      console.debug("[analytics]", payload);
    }
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}
