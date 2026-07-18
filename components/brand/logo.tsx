import { Wordmark } from "./wordmark";
import { siteSettings } from "@/data/site-settings";

/**
 * LOGO — the only way the brand appears on screen.
 *
 * Before this component the wordmark was typeset three different ways (header
 * 17px serif with 0.01em tracking, footer 17px with none, mobile menu at h3).
 * The mark is now artwork, not type, so those inconsistencies cannot recur.
 *
 * Sizing is by HEIGHT only — the wordmark is ~4:1, so fixing the width would
 * make it tower over the 16px type it sits beside. Width follows automatically.
 */
const sizes = {
  /** Header and drawer. ×1.83 — 33.6px inside the 64px bar, so the mark reads as
      a logo rather than as a line of type, with the bar height untouched. */
  header: "h-[1.925rem] sm:h-[2.1rem]",
  /** Footer. ×1.85 — the last thing on the page, so it may sit a little larger. */
  footer: "h-[2.5rem]",
  /** Loading screen. ×1.83. */
  loading: "h-[2.75rem]",
} as const;

export type LogoSize = keyof typeof sizes;

export function Logo({
  size = "header",
  className = "",
}: {
  size?: LogoSize;
  /** Colour goes here (the mark uses currentColor). Defaults to Ink. */
  className?: string;
}) {
  return (
    <span className={`inline-flex text-ink ${className}`}>
      <Wordmark className={`${sizes[size]} w-auto`} />
      {/* The mark is aria-hidden; the name lives here so screen readers and
          search engines still read "See What?" wherever the logo appears. */}
      <span className="sr-only">{siteSettings.brandName}</span>
    </span>
  );
}
