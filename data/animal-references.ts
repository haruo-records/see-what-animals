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
  {
    id: "animal-022",
    specimenNumber: "022",
    imageUrl: "specimen:animal-022",
    archiveUrl: "https://haruo-records.github.io/animals-site/",
    alt: "A low, wide form leaning slightly, with a single pale mark near its upper edge.",
  },
  {
    id: "animal-021",
    specimenNumber: "021",
    imageUrl: "specimen:animal-021",
    archiveUrl: "https://haruo-records.github.io/animals-site/",
    alt: "A tall, narrow form with two rounded shapes gathered at its base.",
  },
  {
    id: "animal-020",
    specimenNumber: "020",
    imageUrl: "specimen:animal-020",
    archiveUrl: "https://haruo-records.github.io/animals-site/",
    alt: "A soft, folded form resting close to the ground with one raised edge.",
  },
];

export function getAnimalReference(id: string): AnimalReference | undefined {
  return animalReferences.find((a) => a.id === id);
}
