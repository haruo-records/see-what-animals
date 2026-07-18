"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * GOOGLE ANALYTICS 4 — the standard gtag.js Google tag, loaded once for the
 * whole site from the root layout. Not GTM; a single GA4 tag.
 *
 * - Both scripts use `afterInteractive` so analytics never blocks rendering.
 * - The inline init has a stable `id` ("google-analytics") so next/script
 *   injects it exactly once and never duplicates it across navigations.
 * - The inline `gtag('config', …)` sends the FIRST page_view on load.
 * - App Router client transitions don't re-run that config, so a small
 *   usePathname effect sends a page_view on each subsequent route change. The
 *   first effect run is skipped, so the initial view is never double-counted.
 */
const GA_MEASUREMENT_ID = "G-Y2WHBEB905";

export function GoogleAnalytics() {
  const pathname = usePathname();
  const skippedInitial = useRef(false);

  useEffect(() => {
    // The initial page_view is already sent by the inline `config` above, so
    // skip the first run to avoid a duplicate on load.
    if (!skippedInitial.current) {
      skippedInitial.current = true;
      return;
    }
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("config", GA_MEASUREMENT_ID, { page_path: pathname });
  }, [pathname]);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
