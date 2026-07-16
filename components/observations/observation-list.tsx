import type { ObservationSession, AnimalReference } from "@/types";
import { ObservationListItem } from "./observation-list-item";

export function ObservationList({
  items,
}: {
  items: { session: ObservationSession; animal: AnimalReference; responses?: number }[];
}) {
  return (
    <div>
      {items.map((it) => (
        <ObservationListItem
          key={it.session.id}
          session={it.session}
          animal={it.animal}
          responses={it.responses}
        />
      ))}
    </div>
  );
}
