import Link from "next/link";
import type { FieldNote } from "@/types";
import { SpecimenForm } from "@/components/observation/specimen-form";
import { formatDate } from "@/lib/observation/session-status";

/** A field note entry in a list. Editorial, not a blog card. */
export function FieldNoteCard({ note }: { note: FieldNote }) {
  return (
    <article className="group">
      <Link href={`/field-notes/${note.slug}`} className="block">
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-sm bg-plaster">
          <SpecimenForm
            seed={note.coverSpecimenId ?? note.slug}
            className="h-full w-full p-10 transition-transform duration-base ease-quiet motion-safe:group-hover:scale-[1.01]"
          />
        </div>
        <p className="u-label mt-6">{note.category}</p>
        <h3 className="mt-3 text-h3 font-normal text-ink">{note.title}</h3>
        <p className="mt-3 max-w-reading text-body text-charcoal">{note.excerpt}</p>
        <p className="mt-4 text-caption text-muted">{formatDate(note.publishedAt)}</p>
      </Link>
    </article>
  );
}
