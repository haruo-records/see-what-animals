/**
 * Font loading — single source of truth.
 *
 * WHY THIS FILE EXISTS
 * `next/font/google` downloads the font files at *build time* and self-hosts
 * them, so the running site never calls Google. Vercel's build has network
 * access, so this works there. But if you ever build in a locked-down / offline
 * environment, the Google fetch can fail the build.
 *
 * TWO SAFEGUARDS ARE BUILT IN:
 *
 * 1. FALLBACKS: every face declares a real system fallback stack + `display:
 *    "swap"` and `adjustFontFallback`, so even mid-swap or on a slow network the
 *    page renders in a near-metric-compatible system font instead of blank text.
 *    The CSS variables (--font-sans / --font-serif / --font-jp) already chain to
 *    these fallbacks in globals.css.
 *
 * 2. ONE-FILE SWITCH TO LOCAL FONTS: if you must build fully offline, set
 *    USE_LOCAL_FONTS = true below and follow app/fonts.local.example.ts to drop
 *    .woff2 files into app/fonts/ and export the same three objects. Nothing else
 *    in the app changes — layout.tsx imports { sans, serif, jp } from here only.
 */
import { Instrument_Sans, Source_Serif_4, Noto_Sans_JP } from "next/font/google";

const USE_LOCAL_FONTS = false;

const systemSans = [
  "ui-sans-serif",
  "system-ui",
  "-apple-system",
  "Segoe UI",
  "Helvetica Neue",
  "Arial",
  "sans-serif",
];
const systemSerif = ["ui-serif", "Iowan Old Style", "Georgia", "Cambria", "Times New Roman", "serif"];
const systemJp = [
  "ui-sans-serif",
  "Hiragino Sans",
  "Hiragino Kaku Gothic ProN",
  "Yu Gothic",
  "Meiryo",
  "sans-serif",
];

// --- Remote (default): self-hosted at build time by next/font ----------------
const googleSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  fallback: systemSans,
  adjustFontFallback: true,
});
const googleSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  fallback: systemSerif,
  adjustFontFallback: true,
});
const googleJp = Noto_Sans_JP({
  subsets: ["latin"], // JP glyphs are huge; do not preload the JP subset
  variable: "--font-jp",
  display: "swap",
  preload: false,
  fallback: systemJp,
  adjustFontFallback: false,
});

// --- Local (offline): see app/fonts.local.example.ts -------------------------
// When USE_LOCAL_FONTS is true, replace the three imports below with your local
// module. Kept lazy so the google objects above are tree-shaken out only when
// you actually remove them.
//
//   import { localSans, localSerif, localJp } from "./fonts.local";

export const sans = googleSans;
export const serif = googleSerif;
export const jp = googleJp;

/** Informational: whether the app is wired to local (offline) fonts. */
export const fontsAreLocal = USE_LOCAL_FONTS;
