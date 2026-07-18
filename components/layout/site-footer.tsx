import Link from "next/link";
import { footerNav } from "@/data/navigation";
import { getDictionary } from "@/locales";
import { Logo } from "@/components/brand/logo";
import { PageShell } from "./page-shell";

const dict = getDictionary("en");

/** A quiet footer. Everything non-essential lives here, not in the header. */
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-stone py-9">
      <PageShell>
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* The mark alone. The old "All works remain in the animals archive."
              line said what the archive link already says. */}
          <div className="max-w-reading">
            <Logo size="footer" />
          </div>

          <nav className="flex flex-col gap-3" aria-label="Footer">
            {footerNav
              .filter((n) => n.enabled)
              .map((item) =>
                item.external ? (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-caption uppercase tracking-[0.12em] text-muted hover:text-charcoal"
                  >
                    {item.label} ↗
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-caption uppercase tracking-[0.12em] text-charcoal hover:text-ink"
                  >
                    {item.label}
                  </Link>
                ),
              )}
          </nav>
        </div>

        <p className="mt-10 text-caption text-muted">© See What? by HARMONEER.</p>
      </PageShell>
    </footer>
  );
}
