"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { playNav, utilityNav, legalNav, type NavItem } from "@/data/navigation";
import { getDictionary } from "@/locales";

const dict = getDictionary("en");

/**
 * The LEFT NAVIGATION — a quiet drawer that slides in from the left (Wordle /
 * NYT Games shape), used on every viewport. See What? is an Observation
 * Platform, so the drawer reads as a list of *observation methods*, not levels:
 *
 *   PLAY
 *     Current Observation · Archive · Lab (soon)
 *   ──────
 *   Shop · Support
 *   ──────
 *   Privacy
 *
 * No overlay fireworks — a still sheet of Paper over a soft scrim.
 */
export function SiteNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  function Item({ item }: { item: NavItem }) {
    if (item.comingSoon || !item.enabled) {
      // Not-yet-open: the label keeps its normal weight and colour; only the
      // small, pale "SOON" marker signals that it is closed. Non-clickable.
      return (
        <span className="flex items-baseline gap-2 text-h3 font-normal text-charcoal">
          {item.label}
          <span className="text-caption uppercase tracking-[0.14em] text-muted">soon</span>
        </span>
      );
    }
    if (item.external) {
      return (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="text-h3 font-normal text-charcoal transition-colors hover:text-ink"
        >
          {item.label} ↗
        </a>
      );
    }
    return (
      <Link
        href={item.href}
        onClick={onClose}
        aria-current={isActive(item.href) ? "page" : undefined}
        className={
          "text-h3 font-normal transition-colors hover:text-ink " +
          (isActive(item.href) ? "text-ink" : "text-charcoal")
        }
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={dict.nav.menu}>
      {/* Soft scrim */}
      <button
        aria-label={dict.nav.close}
        onClick={onClose}
        className="absolute inset-0 bg-ink/20"
        tabIndex={-1}
      />
      {/* Left panel */}
      <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-[380px] flex-col bg-paper px-6 py-0 shadow-placed animate-rise-in sm:px-8">
        {/* Top bar holds only the Close control now — the wordmark was removed so
            the drawer stays quiet and the menu items are the focus. The Close
            button keeps its usual top-right position and the h-16 height matches
            the site header, so no empty gap is left behind. */}
        <div className="flex h-16 items-center justify-end">
          <button
            onClick={onClose}
            className="min-h-[44px] text-caption uppercase tracking-[0.14em] text-charcoal hover:text-ink"
          >
            {dict.nav.close}
          </button>
        </div>

        <nav className="mt-5 flex flex-1 flex-col" aria-label="Primary">
          <p className="u-label mb-4">Play</p>
          <div className="flex flex-col gap-4">
            {playNav.map((item) => (
              <Item key={item.href} item={item} />
            ))}
          </div>

          <hr className="my-6 border-0 border-t border-stone" />

          <div className="flex flex-col gap-4">
            {utilityNav
              .filter((n) => n.enabled || n.comingSoon)
              .map((item) => (
                <Item key={item.href} item={item} />
              ))}
          </div>

          <hr className="my-6 border-0 border-t border-stone" />

          <div className="mt-auto flex flex-col gap-3 pb-8">
            {legalNav.filter((n) => n.enabled).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="text-caption uppercase tracking-[0.14em] text-muted hover:text-charcoal"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
