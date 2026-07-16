/**
 * A minimal pointer to a work that lives in the animals archive.
 * See What? never stores full work detail — the archive is the source of truth.
 * `alt` must describe form without asserting meaning (see README, accessibility).
 */
export type AnimalReference = {
  id: string;
  specimenNumber?: string;
  title?: string;
  provisionalName?: string;
  /** Path under /public/specimens (v0) or, later, a CDN/archive URL. */
  imageUrl: string;
  /** Deep link into the existing animals archive. */
  archiveUrl: string;
  category?: string;
  motion?: string;
  alt: string;
};
