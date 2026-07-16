import Link from "next/link";
import type { ReactNode } from "react";

/** Quiet underlined text link. Underline via border so it sits low and calm. */
export function TextLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={
        "border-b border-stone pb-px text-charcoal transition-colors duration-micro " +
        "hover:border-charcoal hover:text-ink " +
        className
      }
    >
      {children}
    </Link>
  );
}
