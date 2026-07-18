"use client";

import { useEffect, useState } from "react";
import { fetchNaming, type Naming } from "@/lib/naming/client";

/**
 * Shows the work's name: "Unnamed" while observing, or the final two-word name
 * once named. Name only — no reason, no explanation.
 */
export function AnimalName({ animalId }: { animalId: string }) {
  const [naming, setNaming] = useState<Naming>({ name: null, namingStatus: "observing" });

  useEffect(() => {
    let active = true;
    fetchNaming(animalId).then((r) => {
      if (active && r) setNaming(r);
    });
    return () => {
      active = false;
    };
  }, [animalId]);

  const isNamed = naming.namingStatus === "named" && Boolean(naming.name);

  if (isNamed) {
    return <p className="text-body text-charcoal">{naming.name}</p>;
  }
  return <p className="text-caption uppercase tracking-[0.2em] text-muted">Unnamed</p>;
}
