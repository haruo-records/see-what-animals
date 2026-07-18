/**
 * Font loading — single source of truth.
 *
 * `next/font/google` downloads the font files at *build time* and self-hosts
 * them, so the running site never calls Google (Vercel's build has network).
 *
 * IMPORTANT: next/font requires every option to be an inline literal — you may
 * NOT pass a referenced variable (e.g. `fallback: systemSans`). So the fallback
 * arrays are written out in place below. Each face also sets `display: "swap"`
 * and a system fallback stack, so text renders in a near-metric system font if
 * the web font is slow. The CSS vars (--font-sans/serif/jp) chain to these in
 * globals.css.
 *
 * TO MATCH THE ANIMALS SISTER SITE EXACTLY: change the three faces here (or use
 * next/font/local per app/fonts.local.example.ts). layout.tsx imports only
 * { sans, serif, jp } from this file, so this is the single switch point.
 */
import { Instrument_Sans, Source_Serif_4, Noto_Sans_JP } from "next/font/google";

export const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
  adjustFontFallback: true,
});

export const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  fallback: ["ui-serif", "Iowan Old Style", "Georgia", "Cambria", "Times New Roman", "serif"],
  adjustFontFallback: true,
});

export const jp = Noto_Sans_JP({
  subsets: ["latin"], // JP glyphs are huge; do not preload the JP subset
  variable: "--font-jp",
  display: "swap",
  preload: false,
  fallback: ["ui-sans-serif", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", "sans-serif"],
  adjustFontFallback: false,
});
