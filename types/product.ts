export type ProductCategory =
  | "object"
  | "paper-study"
  | "print"
  | "book"
  | "field-note"
  | "card"
  | "digital";

export type ProductAvailability =
  | "available"
  | "sold-out"
  | "coming-soon"
  | "archive";

export type Product = {
  id: string;
  slug: string;
  title: string;
  category: ProductCategory;
  description: string;
  images: string[];
  material?: string;
  dimensions?: string;
  edition?: string;
  price?: number;
  currency?: string;
  availability: ProductAvailability;
  /** External EC link (Shopify/Stripe/BASE/STORES/…). Kept separate from product data. */
  externalPurchaseUrl?: string;
  relatedAnimalIds?: string[];
  relatedObservationIds?: string[];
};
