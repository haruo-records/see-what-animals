import type { AnimalReference, ObservationImage, ObservationPair } from "@/types";

/**
 * Derive the two-image observation pair from an AnimalReference.
 *
 * Backward compatibility: existing sessions carry a single `imageUrl` (today a
 * `specimen:<seed>` placeholder). Rather than break them, this keeps that image
 * as `first` and derives a distinct-but-related `second` so every observation
 * shows two images. Nothing about the existing single-image data is deleted.
 *
 * Migration path: set `secondImageUrl` (and optionally `secondAlt`) on the
 * AnimalReference to promote a real second work / state / angle. No other change
 * is needed anywhere else.
 *
 * The pair carries no ranking: `first`/`second` is display order only.
 */
const PLACEHOLDER_PREFIX = "specimen:";

function isPlaceholder(src: string): boolean {
  return src.startsWith(PLACEHOLDER_PREFIX);
}

export function toObservationPair(animal: AnimalReference): ObservationPair {
  const first: ObservationImage = { src: animal.imageUrl, alt: animal.alt };

  if (animal.secondImageUrl) {
    return {
      first,
      second: { src: animal.secondImageUrl, alt: animal.secondAlt ?? animal.alt },
    };
  }

  // No real second yet: derive a deterministic companion so the layout always
  // has two images to observe. For placeholder art we reuse the seed with a "-b"
  // suffix (a different, related form); otherwise we seed from the id.
  const seed = isPlaceholder(animal.imageUrl)
    ? animal.imageUrl.slice(PLACEHOLDER_PREFIX.length)
    : animal.id;

  const second: ObservationImage = {
    src: `${PLACEHOLDER_PREFIX}${seed}-b`,
    alt: animal.secondAlt ?? "A second form placed beside the first, for slow comparison.",
  };

  return { first, second };
}
