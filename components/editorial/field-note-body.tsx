import type { FieldNoteBlock } from "@/types";
import { Figure } from "./figure";

/** Renders a field note's block list at reading measure. */
export function FieldNoteBody({ blocks }: { blocks: FieldNoteBlock[] }) {
  return (
    <div className="flex flex-col">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h2 key={i} className="mt-12 text-h3 font-normal text-ink">
                {block.text}
              </h2>
            );
          case "paragraph":
            return (
              <p key={i} className="mt-6 text-body-lg leading-relaxed text-charcoal">
                {block.text}
              </p>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="my-9 border-l border-stone pl-6 font-serif text-h3 italic text-charcoal"
              >
                {block.text}
              </blockquote>
            );
          case "figure":
            return (
              <Figure
                key={i}
                specimenId={block.specimenId}
                imageUrl={block.imageUrl}
                alt={block.alt}
                caption={block.caption}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
