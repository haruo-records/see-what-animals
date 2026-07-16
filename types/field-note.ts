export type FieldNoteCategory =
  | "observation"
  | "fieldwork"
  | "making"
  | "objects"
  | "paper"
  | "exhibitions"
  | "notes";

export type FieldNoteBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "figure"; specimenId?: string; imageUrl?: string; caption?: string; alt: string }
  | { type: "quote"; text: string };

export type FieldNote = {
  id: string;
  slug: string;
  title: string;
  category: FieldNoteCategory;
  excerpt: string;
  publishedAt: string;
  coverSpecimenId?: string;
  body: FieldNoteBlock[];
  relatedObservationIds?: string[];
};
