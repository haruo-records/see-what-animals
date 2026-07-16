"use client";

import type { Product } from "@/types";
import { ExternalLink } from "@/components/ui/external-link";
import { trackEvent } from "@/lib/analytics";

const availabilityLabel: Record<Product["availability"], string> = {
  available: "Available",
  "sold-out": "No longer available",
  "coming-soon": "Coming soon",
  archive: "Archive",
};

/** Purchase happens off-site. When no link exists, state availability plainly. */
export function PurchaseLink({ product }: { product: Product }) {
  if (product.availability === "available" && product.externalPurchaseUrl) {
    return (
      <ExternalLink
        href={product.externalPurchaseUrl}
        note="opens the shop"
        onClick={() =>
          trackEvent({ event: "shop_click", product_id: product.id })
        }
        className="text-caption uppercase tracking-[0.14em]"
      >
        Purchase
      </ExternalLink>
    );
  }
  return (
    <span className="text-caption uppercase tracking-[0.14em] text-muted">
      {availabilityLabel[product.availability]}
    </span>
  );
}
