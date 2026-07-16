import type { ReactNode } from "react";

/**
 * PageShell — max-width container with generous side gutters. Widths follow the
 * brief: reading 720, work 1040, shell 1280. Vertical rhythm is left to sections.
 */
export function PageShell({
  children,
  width = "shell",
  className = "",
}: {
  children: ReactNode;
  width?: "reading" | "work" | "shell";
  className?: string;
}) {
  const max =
    width === "reading" ? "max-w-reading" : width === "work" ? "max-w-work" : "max-w-shell";
  return (
    <div className={`mx-auto w-full ${max} px-6 sm:px-8 ${className}`}>{children}</div>
  );
}
