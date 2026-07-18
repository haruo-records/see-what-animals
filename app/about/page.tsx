import { redirect } from "next/navigation";

/**
 * About was retired. The profile now lives on the Support page, which is the hub
 * for the whole project (Concept · Profile · Why support · support).
 *
 * next.config.mjs also 301-redirects /about → /support at the edge; this stub is
 * a safety net and keeps the route from lingering with stale content. Safe to
 * delete the whole app/about/ folder.
 */
export default function AboutRedirect() {
  redirect("/support");
}
