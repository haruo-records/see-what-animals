import Link from "next/link";
import type { ReactNode } from "react";

/**
 * A quiet link with a small outward arrow (↗). Works for internal routes and
 * external URLs. Understated by design — a hairline underline, a faint arrow,
 * no button, no colour. Used for the links at the foot of the About page.
 */
export function ArrowLink({
  href,
  external = false,
  note,
  children,
  className = "",
}: {
  href: string;
  external?: boolean;
  /** Announced to assistive tech (e.g. "opens the animals archive"). */
  note?: string;
  children: ReactNode;
  className?: string;
}) {
  const classes =
    "group inline-flex items-baseline gap-1.5 text-charcoal transition-colors " +
    "duration-micro hover:text-ink " +
    className;

  const inner = (
    <>
      <span className="border-b border-stone pb-px transition-colors group-hover:border-charcoal">
        {children}
      </span>
      <svg
        width="11"
        height="11"
        viewBox="0 0 12 12"
        aria-hidden="true"
        className="translate-y-px opacity-60 transition-opacity group-hover:opacity-100"
      >
        <path
          d="M3 9L9 3M9 3H4M9 3V8"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {note ? <span className="sr-only">({note})</span> : null}
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  );
}
