/**
 * Font loading — single source of truth.
 * next/font requires every option to be an inline literal (no referenced
 * variables), so the fallback arrays are written out in place below.
 * To match the animals sister site, change the three faces here only.
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
  subsets: ["latin"],
  variable: "--font-jp",
  display: "swap",
  preload: false,
  fallback: ["ui-sans-serif", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", "sans-serif"],
  adjustFontFallback: false,
});
