import Image from "next/image";
import type { ObservationImage, ObservationPair } from "@/types";
import { SpecimenForm } from "./specimen-form";

/**
 * SpecimenPair — the Slow Watching observation space.
 *
 * TWO works placed in ONE horizontal space that the viewer moves through — not a
 * slideshow that swaps one for the other. The two images sit side by side in the
 * same white exhibition space; there is no A/B, no before/after, no winner.
 *
 * Responsive behaviour lives in CSS (app/globals.css, `.observation-pair`):
 *   • phone portrait  — a horizontal scroll-snap track; the first work is large
 *                       and the second peeks in from the right (~11%), so its
 *                       presence is felt with no arrow, dot, or "SWIPE" label.
 *   • phone landscape — both works fit on screen at once, sized by height.
 *   • tablet / PC     — both works side by side, centred, no horizontal scroll.
 * No heavy carousel library; plain CSS scroll + scroll-snap only.
 */
function PairFrame({
  image,
  priority = false,
}: {
  image: ObservationImage;
  priority?: boolean;
}) {
  const isPlaceholder = image.src.startsWith("specimen:");
  const seed = isPlaceholder ? image.src.slice("specimen:".length) : image.src;

  return (
    <figure className="observation-pair__frame relative bg-plaster">
      {/* near-white canvas mounted in a narrow mat, single hairline, square
          corners — a placed work, never a rounded/shadowed card. */}
      <div className="absolute inset-[6%] overflow-hidden border border-stone bg-canvas">
        <div className="absolute inset-0 flex items-center justify-center p-[8%]">
          {isPlaceholder ? (
            <SpecimenForm seed={seed} className="h-full w-full motion-safe:animate-breathe" />
          ) : (
            <div className="relative h-full w-full">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={priority}
                sizes="(max-width: 767px) 85vw, 480px"
                className="object-contain"
              />
            </div>
          )}
        </div>
      </div>
      {isPlaceholder ? <figcaption className="sr-only">{image.alt}</figcaption> : null}
    </figure>
  );
}

export function SpecimenPair({
  pair,
  priority = false,
}: {
  pair: ObservationPair;
  priority?: boolean;
}) {
  return (
    // A focusable region so the horizontal space is reachable and scrollable by
    // keyboard as well as touch. role="group" + label so it reads as one unit.
    <div
      className="observation-pair"
      role="group"
      aria-label="Two images to observe, placed side by side"
      tabIndex={0}
    >
      <div className="observation-pair__item">
        <PairFrame image={pair.first} priority={priority} />
      </div>
      <div className="observation-pair__item">
        <PairFrame image={pair.second} />
      </div>
    </div>
  );
}
