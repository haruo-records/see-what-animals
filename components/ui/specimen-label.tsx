import type { ReactNode } from "react";

/** Museum-caption eyebrow: uppercase, tracked, Stone. */
export function SpecimenLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`u-label block ${className}`}>{children}</span>
  );
}
