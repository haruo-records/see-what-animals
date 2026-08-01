import type { AnimalReference } from "@/types";

/**
 * Minimal pointers into the animals archive. The archive is the source of truth;
 * keep only what an observation session needs. `imageUrl` may be a real path
 * under /public/specimens or a generated SVG placeholder key (see
 * components/observation/specimen-form.tsx).
 *
 * ADD A NEW WORK: append an entry, then reference its `id` from a session.
 * For the two-image observation layout, set `secondImageUrl` (+ `secondAlt`).
 * `first` / `second` is display order only — no ranking, no before/after.
 */
export const animalReferences: AnimalReference[] = [
  {
    id: "animal-024",
    specimenNumber: "024",
    provisionalName: undefined,
    imageUrl: "/specimens/animal-024-a.png",
    secondImageUrl: "/specimens/animal-024-b.png",
    archiveUrl: "https://haruo-records.github.io/animals-site/",
    category: undefined,
    motion: undefined,
    alt: "A standing form on two short supports, topped by several long curved shapes fanning out around a small circle, with one long line running down to the ground.",
    secondAlt:
      "A rounded shape holding a spiral of curved segments around a small centre, set on a tapering column that bends into one long flat limb.",
  },
  // The placeholder reference used before a real work existed (animal-023) was
  // removed when 024 was registered. Append a new entry here when the next work
  // is added, then point a session's `animalId` at it.
];

export function getAnimalReference(id: string): AnimalReference | undefined {
  return animalReferences.find((a) => a.id === id);
}
