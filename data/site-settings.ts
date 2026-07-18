/**
 * SITE SETTINGS — one place for run-wide switches. No component hardcodes these.
 * The site is English-only.
 */
export const siteSettings = {
  brandName: "See What?",
  /**
   * THE tagline. Used by every title, OGP and JSON-LD string — never retyped
   * in a component. See What? is not defined as a game anywhere.
   */
  tagline: "A place to see before naming.",
  /** Secondary brand line, for About and editorial contexts only. */
  altTagline: "Where words fall short, observation begins.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://see-what.example",
  animalsArchiveUrl:
    process.env.NEXT_PUBLIC_ANIMALS_ARCHIVE_URL ??
    "https://haruo-records.github.io/animals-site/",

  /** The person behind the project — shown in the Support page profile. */
  creatorName: "HARUO",

  /**
   * External project links, surfaced quietly under the profile on the Support
   * page ("Continue exploring"). SNS is intentionally omitted for now — today
   * people arrive via SNS, so X / Instagram are added later once press or
   * word-of-mouth traffic grows.
   */
  noteUrl: process.env.NEXT_PUBLIC_NOTE_URL ?? "https://note.com/",
  substackUrl: process.env.NEXT_PUBLIC_SUBSTACK_URL ?? "https://substack.com/",

  /** Quiet fallback contact on the Support page (optional). */
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "",

  /** Session clock. Change to alter how status is derived. */
  timezone: "Asia/Tokyo",
  defaultSessionDays: 7,

  /** English-only. */
  defaultLocale: "en" as const,
  locales: ["en"] as const,

  /** Observation note limits. */
  noteMaxLength: 160,

  /** Analytics — populated from env; empty disables tracking cleanly. */
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
  gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? "",
};

export type Locale = (typeof siteSettings.locales)[number];
