import type { Metadata } from "next";
import { fieldNotes } from "@/data/field-notes";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { FieldNoteCard } from "@/components/editorial/field-note-card";

export const metadata: Metadata = {
  title: "Field Notes",
  description:
    "Observations, fieldwork, and the making of objects and paper — an edited journal.",
};

export default function FieldNotesPage() {
  const notes = [...fieldNotes].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return (
    <section className="py-18">
      <PageShell width="work">
        <SectionHeading
          as="h1"
          eyebrow="An edited journal"
          title="Field Notes"
          className="mb-8"
        />
        <p className="mb-20 max-w-reading text-body-lg text-charcoal">
          Notes from observing, from fieldwork, and from making objects and paper. Read slowly.
        </p>
        <div className="grid grid-cols-1 gap-x-12 gap-y-20 md:grid-cols-2">
          {notes.map((note) => (
            <FieldNoteCard key={note.id} note={note} />
          ))}
        </div>
      </PageShell>
    </section>
  );
}
