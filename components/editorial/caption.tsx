import type { ReactNode } from "react";

export function Caption({ children }: { children: ReactNode }) {
  return <figcaption className="mt-3 text-caption text-muted">{children}</figcaption>;
}
