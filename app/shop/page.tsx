import type { Metadata } from "next";
import { products } from "@/data/products";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductList } from "@/components/shop/product-list";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Small objects, paper studies, prints, and books — observation returned to the hand.",
};

export default function ShopPage() {
  return (
    <section className="py-18">
      <PageShell width="work">
        <SectionHeading as="h1" eyebrow="Objects & editions" title="Shop" className="mb-8" />
        <p className="mb-20 max-w-reading text-body-lg text-charcoal">
          Small forms to hold or set down, sheets that fold into standing figures, and books that
          gather the notes. Made in limited numbers, treated as small works. Purchase is completed
          on a separate shop.
        </p>
        <ProductList products={products} />
      </PageShell>
    </section>
  );
}
