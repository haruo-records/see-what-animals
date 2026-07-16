import type { ReactNode } from "react";
import { SpecimenLabel } from "./specimen-label";

/** Section opener: quiet eyebrow + calm heading. No heavy weights. */
export function SectionHeading({
  eyebrow,
  title,
  as: As = "h2",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  const size = As === "h1" ? "text-h1" : As === "h3" ? "text-h3" : "text-h2";
  return (
    <div className={className}>
      {eyebrow ? <SpecimenLabel className="mb-4">{eyebrow}</SpecimenLabel> : null}
      <As className={`${size} font-normal text-ink`}>{title}</As>
    </div>
  );
}
