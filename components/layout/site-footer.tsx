import Link from "next/link";
import { footerNav } from "@/data/navigation";
import { getDictionary } from "@/locales";
import { Logo } from "@/components/brand/logo";
import { PageShell } from "./page-shell";

const dict = getDictionary("en");

/** A quiet footer. Everything non-essential lives here, not in the header. */
export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-stone py-12">
      <PageShell>
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-reading">
            <Logo size="footer" />
            <p className="mt-4 text-caption text-muted">{dict.footer.rights}</p>
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

        <p className="mt-16 text-caption text-muted">© See What? by HARMONEER.</p>
      </PageShell>
    </footer>
  );
}
