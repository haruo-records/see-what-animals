import type { ReactNode } from "react";

/**
 * A quiet external link with a small, non-shouting marker. Used above all for
 * the animals archive. `note` is announced to assistive tech.
 */
export function ExternalLink({
  href,
  children,
  note,
  className = "",
  onClick,
}: {
  href: string;
  children: ReactNode;
  note?: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={
        "group inline-flex items-baseline gap-2 border-b border-stone pb-px " +
        "text-charcoal transition-colors duration-micro hover:border-charcoal hover:text-ink " +
        className
      }
    >
      <span>{children}</span>
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
    </a>
  );
}
