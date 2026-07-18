import Link from "next/link";
import { footerNav } from "@/data/navigation";
import { getDictionary } from "@/locales";
import { PageShell } from "./page-shell";

const dict = getDictionary("en");

/** A quiet footer. Everything non-essential lives here, not in the header. */
export function SiteFooter() {
  return (
    <footer className="mt-40 border-t border-stone py-16">
      <PageShell>
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-reading">
            <p className="font-serif text-[1.0625rem] leading-none text-ink">{dict.brand}</p>
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

        <p className="mt-16 text-caption text-muted">
          © {new Date().getFullYear()} {dict.brand}
        </p>
      </PageShell>
    </footer>
  );
}
