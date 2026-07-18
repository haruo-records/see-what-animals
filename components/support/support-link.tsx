"use client";

import type { ReactNode } from "react";

/**
 * A Stripe support link that also emits a GA4 `support_click` event on click.
 *
 * The event is a fire-and-forget `gtag` call (a synchronous dataLayer push):
 * it never calls preventDefault, never awaits, and never delays or blocks the
 * navigation to Stripe. If GA hasn't loaded (or is blocked), the link still
 * works exactly as before. Styling/target/rel are passed through unchanged, so
 * the button is visually identical to a plain link.
 */
export function SupportLink({
  href,
  supportType,
  amount,
  className,
  children,
}: {
  href: string;
  supportType: "one_time" | "monthly";
  amount: number | "custom";
  className?: string;
  children: ReactNode;
}) {
  function handleClick() {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "support_click", {
        support_type: supportType,
        amount,
        destination: "stripe",
      });
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
