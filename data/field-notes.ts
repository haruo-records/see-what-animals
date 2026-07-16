import type { FieldNote } from "@/types";

/**
 * FIELD NOTES — edited entries, closer to a journal than a blog. Body is a small
 * block list so figures and captions can be placed deliberately. Add a note by
 * appending an entry with a new slug.
 */
export const fieldNotes: FieldNote[] = [
  {
    id: "fn-001",
    slug: "before-naming",
    title: "Before naming",
    category: "observation",
    excerpt:
      "What happens in the seconds before a shape becomes a word.",
    publishedAt: "2026-07-10",
    coverSpecimenId: "fn-001",
    body: [
      {
        type: "paragraph",
        text: "There is a short moment, before a form becomes a bird or a boat, when it is only itself. We are trying to keep that moment open a little longer.",
      },
      {
        type: "figure",
        specimenId: "fn-001-a",
        alt: "A rounded form with one raised edge, set on a pale ground.",
        caption: "Observation 020, as first set down.",
      },
      {
        type: "paragraph",
        text: "Most people name it within a second. A few never do. Both are ways of seeing, and the record keeps them side by side.",
      },
    ],
    relatedObservationIds: ["observation-020"],
  },
  {
    id: "fn-002",
    slug: "folding-paper-study-017",
    title: "Folding Paper Study 017",
    category: "paper",
    excerpt: "A flat sheet becomes a standing form in eleven folds.",
    publishedAt: "2026-07-03",
    coverSpecimenId: "fn-002",
    body: [
      {
        type: "paragraph",
        text: "Paper Study 017 arrives flat. The folding is the work — a few minutes with your hands, and a form stands up on the table.",
      },
      {
        type: "quote",
        text: "The instructions are deliberately incomplete. Where they stop, you decide.",
      },
      {
        type: "paragraph",
        text: "No two folded copies are the same. That is not a defect of the method. It is the method.",
      },
    ],
  },
  {
    id: "fn-003",
    slug: "a-shelf-in-the-afternoon",
    title: "A shelf in the afternoon",
    category: "objects",
    excerpt: "Where a small object sits, and what the light does to it.",
    publishedAt: "2026-06-24",
    coverSpecimenId: "fn-003",
    body: [
      {
        type: "paragraph",
        text: "An object is only half made in the studio. The rest happens where you set it down — on a shelf, near a window, in the hour the light goes long.",
      },
      {
        type: "figure",
        specimenId: "fn-003-a",
        alt: "A small standing form casting a soft, single shadow.",
        caption: "Object Study 023, late afternoon.",
      },
    ],
  },
];

export function getFieldNoteBySlug(slug: string): FieldNote | undefined {
  return fieldNotes.find((n) => n.slug === slug);
}
