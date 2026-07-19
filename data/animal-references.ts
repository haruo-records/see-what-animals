import type { AnimalReference } from "@/types";

/**
 * Minimal pointers into the animals archive. The archive is the source of truth;
 * keep only what an observation session needs. `imageUrl` currently points to a
 * generated SVG placeholder key (see components/observation/specimen-form.tsx).
 * Replace with real image paths under /public/specimens when available.
 *
 * ADD A NEW WORK: append an entry, then reference its `id` from a session.
 */
export const animalReferences: AnimalReference[] = [
  {
    id: "animal-023",
    specimenNumber: "023",
    provisionalName: undefined,
    imageUrl: "specimen:animal-023",
    archiveUrl: "https://haruo-records.github.io/animals-site/",
    category: undefined,
    motion: undefined,
    alt: "An abstract form with a rounded body and three smaller shapes set nearby.",
  },
  // References for the past demo observations (020–022) were removed together
  // with their sessions so the Archive opens empty. Append a new entry here when
  // a real work is added, then point a session's `animalId` at it.
];

export function getAnimalReference(id: string): AnimalReference | undefined {
  return animalReferences.find((a) => a.id === id);
}
