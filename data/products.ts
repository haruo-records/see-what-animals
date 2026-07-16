import type { Product } from "@/types";

/**
 * PRODUCTS — mock catalogue. No checkout is implemented: purchase happens via
 * `externalPurchaseUrl` (Shopify/Stripe/BASE/STORES/…). Product data and the EC
 * link are kept separate so the store is not coupled to any one provider.
 *
 * Treat objects as small sculpture, not merch. Images use specimen placeholders
 * (specimen:<id>) until real photography is placed under /public/specimens.
 */
export const products: Product[] = [
  {
    id: "object-023",
    slug: "object-study-023",
    title: "Object Study 023",
    category: "object",
    description:
      "A small cast form, sized to be held or set on a shelf. Made from the same observation that opened Observation 023.",
    images: ["specimen:object-023"],
    material: "Hand-finished plaster composite",
    dimensions: "H 90 × W 70 × D 60 mm",
    edition: "Edition of 30",
    price: 14000,
    currency: "JPY",
    availability: "available",
    externalPurchaseUrl: "https://example.com/shop/object-study-023",
    relatedAnimalIds: ["animal-023"],
    relatedObservationIds: ["observation-023"],
  },
  {
    id: "paper-017",
    slug: "paper-study-017",
    title: "Paper Study 017",
    category: "paper-study",
    description:
      "A single-sheet form that folds into a standing figure. Sent flat, folded by you.",
    images: ["specimen:paper-017"],
    material: "Mould-made cotton paper, 250 gsm",
    dimensions: "Flat: 210 × 210 mm",
    edition: "Open edition",
    price: 2400,
    currency: "JPY",
    availability: "available",
    externalPurchaseUrl: "https://example.com/shop/paper-study-017",
    relatedObservationIds: ["observation-021"],
  },
  {
    id: "print-012",
    slug: "observation-print-012",
    title: "Observation Print 012",
    category: "print",
    description:
      "A pigment print recording how one form was seen across a week of observation.",
    images: ["specimen:print-012"],
    material: "Archival pigment on cotton rag",
    dimensions: "297 × 420 mm (A3)",
    edition: "Edition of 50",
    price: 9000,
    currency: "JPY",
    availability: "sold-out",
    relatedObservationIds: ["observation-020"],
  },
  {
    id: "book-01",
    slug: "field-notes-vol-01",
    title: "Field Notes Vol. 01",
    category: "book",
    description:
      "The first collected notes — observations, fieldwork, and making, gathered as a small book.",
    images: ["specimen:book-01"],
    material: "Offset print, sewn binding, 96 pages",
    dimensions: "148 × 210 mm",
    price: 3200,
    currency: "JPY",
    availability: "coming-soon",
  },
  {
    id: "cards-01",
    slug: "specimen-cards",
    title: "Specimen Cards",
    category: "card",
    description:
      "A set of cards, one form to a card, with room to write what you saw.",
    images: ["specimen:cards-01"],
    material: "Letterpress on board",
    dimensions: "100 × 148 mm, set of 8",
    price: 2800,
    currency: "JPY",
    availability: "available",
    externalPurchaseUrl: "https://example.com/shop/specimen-cards",
  },
  {
    id: "digital-023",
    slug: "observation-023-download",
    title: "Observation 023 — Digital Study",
    category: "digital",
    description: "A downloadable high-resolution study of Observation 023, to print at home.",
    images: ["specimen:digital-023"],
    availability: "available",
    price: 800,
    currency: "JPY",
    externalPurchaseUrl: "https://example.com/shop/observation-023-download",
    relatedObservationIds: ["observation-023"],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
