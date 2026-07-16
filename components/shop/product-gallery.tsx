import { SpecimenForm } from "@/components/observation/specimen-form";
import Image from "next/image";

/** Product imagery. Placeholder forms until real photography is added. */
export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const first = images[0] ?? `specimen:${title}`;
  const isPlaceholder = first.startsWith("specimen:");
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-plaster">
      {isPlaceholder ? (
        <SpecimenForm seed={first} className="h-full w-full p-12" />
      ) : (
        <Image src={first} alt={title} fill sizes="(max-width:768px) 100vw, 520px" className="object-contain p-10" />
      )}
    </div>
  );
}
