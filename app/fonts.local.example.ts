/**
 * OFFLINE / LOCAL FONT SETUP (optional)
 * =====================================
 * Use this only if your build environment cannot reach Google Fonts.
 *
 * STEPS
 * 1. Download the .woff2 files you are licensed to self-host and place them in
 *    app/fonts/ , e.g.:
 *      app/fonts/InstrumentSans-Variable.woff2
 *      app/fonts/SourceSerif4-Variable.woff2
 *      app/fonts/NotoSansJP-Variable.woff2   (optional; large)
 *
 * 2. Copy this file to app/fonts.local.ts and uncomment the implementation.
 *
 * 3. In app/fonts.ts:
 *      - set USE_LOCAL_FONTS = true
 *      - import { localSans, localSerif, localJp } from "./fonts.local"
 *      - export const sans = localSans; (etc.)
 *
 * Nothing else in the app changes — layout.tsx only ever imports
 * { sans, serif, jp } from "@/app/fonts" (relative "./fonts").
 */

// import localFont from "next/font/local";
//
// export const localSans = localFont({
//   src: [{ path: "./fonts/InstrumentSans-Variable.woff2", weight: "400 700", style: "normal" }],
//   variable: "--font-sans",
//   display: "swap",
//   fallback: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Arial", "sans-serif"],
// });
//
// export const localSerif = localFont({
//   src: [{ path: "./fonts/SourceSerif4-Variable.woff2", weight: "400 600", style: "normal" }],
//   variable: "--font-serif",
//   display: "swap",
//   fallback: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "serif"],
// });
//
// export const localJp = localFont({
//   src: [{ path: "./fonts/NotoSansJP-Variable.woff2", weight: "400 700", style: "normal" }],
//   variable: "--font-jp",
//   display: "swap",
//   preload: false,
//   fallback: ["ui-sans-serif", "Hiragino Sans", "Yu Gothic", "Meiryo", "sans-serif"],
// });

export {};
