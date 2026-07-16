import Image from "next/image";
import type { AnimalReference } from "@/types";
import { SpecimenForm } from "./specimen-form";

/**
 * A mounted work, four quiet layers so it reads as one framed object on a Paper
 * wall — the frame never competes with the work:
 *
 *   Plaster mat  (bg-plaster)     — a narrow mat, a touch darker than the page
 *     └ frame line (border-stone) — a single hairline, square corners
 *        └ Canvas (bg-canvas)     — near-white; the only white surface
 *           └ animals             — the work
 *
 * size "stage" is the centrepiece; "card" is a small list thumbnail.
 */
export function SpecimenView({
  animal,
  priority = false,
  size = "stage",
}: {
  animal: AnimalReference;
  priority?: boolean;
  size?: "stage" | "card";
}) {
  const isPlaceholder = animal.imageUrl.startsWith("specimen:");
  const seed = isPlaceholder ? animal.imageUrl.slice("specimen:".length) : animal.id;
  const isStage = size === "stage";

  const matInset = isStage ? "inset-[6%]" : "inset-[6%]";
  const artPad = isStage ? "p-[8%]" : "p-[10%]";

  return (
    <figure
      className={
        "relative aspect-square w-full bg-plaster " +
        // barely-there lift on the centrepiece; none on thumbnails
        (isStage ? "shadow-[0_8px_24px_-18px_rgba(30,30,25,0.10)]" : "")
      }
    >
      {/* near-white canvas mounted in the mat, single hairline, square corners */}
      <div className={`absolute ${matInset} overflow-hidden border border-stone bg-canvas`}>
        <div className={`absolute inset-0 flex items-center justify-center ${artPad}`}>
          {isPlaceholder ? (
            <SpecimenForm seed={seed} className="h-full w-full motion-safe:animate-breathe" />
          ) : (
            <div className="relative h-full w-full">
              <Image
                src={animal.imageUrl}
                alt={animal.alt}
                fill
                priority={priority}
                sizes="(max-width: 768px) 90vw, 640px"
                className="object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {isPlaceholder ? <figcaption className="sr-only">{animal.alt}</figcaption> : null}
    </figure>
  );
}
