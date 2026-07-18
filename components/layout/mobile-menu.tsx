"use client";

import { useEffect } from "react";
import Link from "next/link";
import { primaryNav, footerNav } from "@/data/navigation";
import { getDictionary } from "@/locales";
import { Logo } from "@/components/brand/logo";

const dict = getDictionary("en");

/** A quiet, full-screen menu. No overlay fireworks — a still sheet of Paper. */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
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

  return (
    <div
      className="fixed inset-0 z-50 bg-paper animate-rise-in"
      role="dialog"
      aria-modal="true"
      aria-label={dict.nav.menu}
    >
      <div className="mx-auto flex h-full max-w-shell flex-col px-6 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          <Logo size="header" />
          <button
            onClick={onClose}
            className="min-h-[44px] text-caption uppercase tracking-[0.14em] text-charcoal hover:text-ink"
          >
            {dict.nav.close}
          </button>
        </div>

        <nav className="mt-12 flex flex-col gap-6" aria-label="Primary">
          {primaryNav
            .filter((n) => n.enabled)
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="text-h2 font-normal text-ink transition-colors hover:text-charcoal"
              >
                {item.label}
              </Link>
            ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3 py-12">
          {footerNav
            .filter((n) => n.enabled)
            .map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-caption uppercase tracking-[0.14em] text-muted hover:text-charcoal"
                >
                  {item.label} ↗
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="text-caption uppercase tracking-[0.14em] text-muted hover:text-charcoal"
                >
                  {item.label}
                </Link>
              ),
            )}
        </div>
      </div>
    </div>
  );
}
