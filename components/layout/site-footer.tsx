import Link from "next/link";
import { footerNav } from "@/data/navigation";
import { PageShell } from "./page-shell";

/**
 * A quiet footer — one line of it.
 *
 * The wordmark was removed: the header already carries the mark on every
 * screen, and repeating it at the foot only added height to scroll past. What
 * remains is the one outward link and the copyright, side by side on desktop
 * and stacked on small screens.
 */
export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-stone py-8">
      <PageShell>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-col gap-3 sm:flex-row sm:gap-8" aria-label="Footer">
            {footerNav
              .filter((n) => n.enabled)
              .map((item) =>
                item.external ? (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-caption uppercase tracking-[0.12em] text-muted transition-colors hover:text-charcoal"
                  >
                    {item.label} ↗
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-caption uppercase tracking-[0.12em] text-charcoal transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                ),
              )}
          </nav>

          <p className="text-caption text-muted">© See What? by HARMONEER.</p>
        </div>
      </PageShell>
    </footer>
  );
}
