"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { getDictionary } from "@/locales";
import { SiteNav } from "./mobile-menu";

const dict = getDictionary("en");

/**
 * Quiet header, three parts (learned from Wordle / NYT Games):
 *   left   — the menu button, opening the left navigation drawer,
 *   centre — the wordmark, returning to `/` (the current observation),
 *   right  — Support, always present. Like a quiet "Subscribe": part of the
 *            brand, never an ad.
 * Everything else (Play, Archive, Shop, Privacy) lives in the drawer.
 *
 * STICKY, not fixed. A fixed header is removed from flow, so the page must be
 * padded to compensate and every in-page anchor lands 64px under the bar.
 * Sticky stays in flow: no compensating padding on <main>, no anchor offset,
 * no layout shift on first paint.
 *
 * bg-paper is opaque, so content passes underneath rather than showing through.
 * No shadow, no rule — the bar should be felt, not seen.
 */
export function SiteHeader() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-paper">
        <div className="mx-auto grid h-16 max-w-shell grid-cols-[1fr_auto_1fr] items-center px-6 sm:px-8">
          <div className="justify-self-start">
            <button
              onClick={() => setNavOpen(true)}
              className="-ml-1 inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-charcoal transition-colors hover:text-ink"
              aria-haspopup="dialog"
              aria-expanded={navOpen}
              aria-label={dict.nav.menu}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none">
                <path
                  d="M3 6h14M3 10h14M3 14h14"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <Link
            href="/"
            className="flex items-center justify-self-center text-ink"
            aria-label={`${dict.brand} — current observation`}
          >
            <Logo size="header" />
          </Link>

          <div className="justify-self-end">
            <Link
              href="/support"
              className="inline-flex min-h-[44px] items-center text-caption uppercase tracking-[0.14em] text-charcoal transition-colors hover:text-ink"
            >
              Support
            </Link>
          </div>
        </div>
      </header>

      {/* Outside <header> on purpose. A sticky, z-indexed element forms a
          stacking context; leaving the drawer inside would trap its z-50 within
          the header's z-40 layer. As a sibling it is free to sit above
          everything, whatever the header does later. */}
      <SiteNav open={navOpen} onClose={() => setNavOpen(false)} />
    </>
  );
}
