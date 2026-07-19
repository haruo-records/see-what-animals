/**
 * The two-image observation unit (Slow Watching).
 *
 * A single Observation is looked at through TWO images placed in one horizontal
 * space. The pair is never a quiz — there is no correct/incorrect, no A/B, no
 * before/after. `first` and `second` are simply the two things a viewer moves
 * their eyes between. Order is meaningful and preserved (first is shown large,
 * second peeks in from the side).
 *
 * The shape is deliberately open so a pair can be any of: two different works,
 * one work in two states, one work from two angles, two images separated in
 * time, or two works that share a form.
 */
export type ObservationImage = {
  /** Path under /public/specimens, a `specimen:<seed>` placeholder key, or a URL. */
  src: string;
  /** Describes form without asserting meaning (see accessibility notes). */
  alt: string;
};

export type ObservationPair = {
  first: ObservationImage;
  second: ObservationImage;
};
