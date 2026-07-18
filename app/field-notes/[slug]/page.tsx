import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fieldNotes, getFieldNoteBySlug } from "@/data/field-notes";
import { siteSettings } from "@/data/site-settings";
import { formatDate } from "@/lib/observation/session-status";
import { PageShell } from "@/components/layout/page-shell";
import { FieldNoteBody } from "@/components/editorial/field-note-body";
import { Divider } from "@/components/ui/divider";
import { TextLink } from "@/components/ui/text-link";

export function generateStaticParams() {
  return fieldNotes.map((n) => ({ slug: n.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const note = getFieldNoteBySlug(params.slug);
  if (!note) return {};
  return {
    title: note.title,
    description: note.excerpt,
    openGraph: { type: "article", title: note.title, description: note.excerpt },
  };
}

export default function FieldNoteDetailPage({ params }: { params: { slug: string } }) {
  const note = getFieldNoteBySlug(params.slug);
  if (!note) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: note.title,
    datePublished: note.publishedAt,
    url: `${siteSettings.siteUrl}/field-notes/${note.slug}`,
    description: note.excerpt,
  };

  return (
    <article className="py-18">
      <PageShell width="reading">
        <p className="u-label">{note.category}</p>
        <h1 className="mt-6 text-h1 font-normal text-ink">{note.title}</h1>
        <p className="mt-6 text-caption text-muted">{formatDate(note.publishedAt)}</p>

        <FieldNoteBody blocks={note.body} />

        <Divider className="my-16" />
        <TextLink href="/field-notes">Back to Field Notes</TextLink>
      </PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </article>
  );
}
