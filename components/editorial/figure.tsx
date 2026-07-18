import Image from "next/image";
import { SpecimenForm } from "@/components/observation/specimen-form";
import { Caption } from "./caption";

/** Editorial figure. Uses a generated specimen form until real imagery exists. */
export function Figure({
  specimenId,
  imageUrl,
  alt,
  caption,
}: {
  specimenId?: string;
  imageUrl?: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="my-9">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-plaster">
        {imageUrl ? (
          <Image src={imageUrl} alt={alt} fill sizes="720px" className="object-contain p-8" />
        ) : (
          <>
            <SpecimenForm seed={specimenId ?? alt} className="h-full w-full p-10" />
            <span className="sr-only">{alt}</span>
          </>
        )}
      </div>
      {caption ? <Caption>{caption}</Caption> : null}
    </figure>
  );
}
