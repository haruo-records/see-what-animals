"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNav } from "@/data/navigation";
import { Logo } from "@/components/brand/logo";
import { getDictionary } from "@/locales";
import { MobileMenu } from "./mobile-menu";

const dict = getDictionary("en");

/**
 * Quiet header. The wordmark returns to `/` — the current observation. Only two
 * secondary destinations (About, Shop); everything else lives in the footer.
 */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="relative z-40">
      <div className="mx-auto flex h-16 max-w-shell items-center justify-between px-6 sm:px-8">
        <Link
          href="/"
          className="flex items-center text-ink"
          aria-label={`${dict.brand} — current observation`}
        >
          <Logo size="header" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {primaryNav
            .filter((n) => n.enabled)
            .map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    "text-caption uppercase tracking-[0.12em] transition-colors " +
                    (active ? "text-ink" : "text-charcoal hover:text-ink")
                  }
                >
                  {item.label}
                </Link>
              );
            })}
        </nav>

        <button
          onClick={() => setMenuOpen(true)}
          className="min-h-[44px] text-caption uppercase tracking-[0.14em] text-charcoal hover:text-ink md:hidden"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
        >
          {dict.nav.menu}
        </button>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
