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
  /**
   * Optional second image for the two-image observation layout (Slow Watching).
   * When absent, a deterministic companion form is derived so the observation
   * still shows two images — see lib/observation/observation-pair.ts. Provide a
   * real value to migrate a session to a genuine second work / state / angle.
   * Not a "correct" or "after" image — just the second thing to observe.
   */
  secondImageUrl?: string;
  /** Alt for `secondImageUrl`; falls back to a neutral description when absent. */
  secondAlt?: string;
  /** Deep link into the existing animals archive. */
  archiveUrl: string;
  category?: string;
  motion?: string;
  alt: string;
};
