import type { Config } from "tailwindcss";

/**
 * Design tokens for See What?
 * Palette, spacing, radius, shadow and type scale are declared here AND mirrored
 * as CSS custom properties in app/globals.css so both Tailwind classes and raw
 * CSS can reference the same source of truth. Change a value in both places.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    // Deliberately narrow palette. Colours map 1:1 to the brief's tokens.
    colors: {
      transparent: "transparent",
      current: "currentColor",
      paper: "var(--color-paper)",
      plaster: "var(--color-plaster)",
      canvas: "var(--color-canvas)",
      stone: "var(--color-stone)",
      muted: "var(--color-muted)",
      charcoal: "var(--color-charcoal)",
      ink: "var(--color-ink)",
      moss: "var(--color-moss)",
      water: "var(--color-water)",
      clay: "var(--color-clay)",
      sand: "var(--color-sand)",
      dusk: "var(--color-dusk)",
    },
    // NOTE: spacing is intentionally left as Tailwind's default 4px scale, which
    // already yields the brief's rhythm (1=4, 2=8, 3=12, 4=16, 6=24, 8=32,
    // 12=48, 16=64, 24=96, 36=144). Overriding it would drop intermediate steps.
    borderRadius: {
      none: "0",
      sm: "4px",
      DEFAULT: "8px",
      md: "8px",
      lg: "12px",
      full: "9999px",
    },
    boxShadow: {
      none: "none",
      // Objects set down quietly. Single light source, low contrast.
      placed: "0 2px 8px rgba(30,30,25,0.05), 0 16px 48px rgba(30,30,25,0.08)",
      subtle: "0 1px 4px rgba(30,30,25,0.05)",
    },
    extend: {
      maxWidth: {
        shell: "1280px",
        reading: "720px",
        work: "1040px",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        jp: ["var(--font-jp)", "var(--font-sans)", "sans-serif"],
      },
      fontSize: {
        // Quieter, editorial scale — closer to the animals sister site's restraint.
        // (Exact typeface is swapped in one place: app/fonts.ts.)
        display: ["clamp(2.25rem, 5vw, 3.25rem)", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        h1: ["clamp(1.75rem, 3.5vw, 2.5rem)", { lineHeight: "1.16", letterSpacing: "-0.005em" }],
        h2: ["clamp(1.5rem, 2.6vw, 2rem)", { lineHeight: "1.2" }],
        h3: ["clamp(1.1875rem, 1.8vw, 1.4rem)", { lineHeight: "1.32" }],
        "body-lg": ["1.125rem", { lineHeight: "1.72" }],
        body: ["1rem", { lineHeight: "1.75" }],
        caption: ["0.8125rem", { lineHeight: "1.5", letterSpacing: "0.01em" }],
        label: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.18em" }],
      },
      transitionTimingFunction: {
        quiet: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
      transitionDuration: {
        micro: "160ms",
        base: "300ms",
        reveal: "640ms",
      },
      keyframes: {
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.012)" },
        },
      },
      animation: {
        "rise-in": "rise-in 640ms cubic-bezier(0.22,0.61,0.36,1) both",
        breathe: "breathe 9s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
