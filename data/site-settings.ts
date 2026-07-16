/**
 * SITE SETTINGS — one place for run-wide switches. No component hardcodes these.
 */
export const siteSettings = {
  brandName: "See What?",
  tagline: { en: "Observation is a luxury.", ja: "観察する時間は、贅沢である。" },
  altTagline: { en: "Stay with what you see.", ja: "見えたものと、しばらく一緒に。" },
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://see-what.example",
  animalsArchiveUrl:
    process.env.NEXT_PUBLIC_ANIMALS_ARCHIVE_URL ??
    "https://haruo-records.github.io/animals-site/",

  /** Session clock. Change to alter how status is derived. */
  timezone: "Asia/Tokyo",
  defaultSessionDays: 7,

  /** Locale scaffolding. English default; ja dictionary present for later. */
  defaultLocale: "en" as const,
  locales: ["en", "ja"] as const,

  /** Observation note limits. */
  noteMaxLength: 160,

  /** Analytics — populated from env; empty disables tracking cleanly. */
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
  gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? "",
};

export type Locale = (typeof siteSettings.locales)[number];
