import Link from "next/link";
import type { Product } from "@/types";
import { SpecimenForm } from "@/components/observation/specimen-form";

const availabilityNote: Partial<Record<Product["availability"], string>> = {
  "sold-out": "No longer available",
  "coming-soon": "Coming soon",
  archive: "Archive",
};

export function ProductItem({ product }: { product: Product }) {
  const note = availabilityNote[product.availability];
  return (
    <article className="group">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-plaster">
          <SpecimenForm
            seed={product.images[0] ?? product.slug}
            className="h-full w-full p-10 transition-transform duration-base ease-quiet motion-safe:group-hover:scale-[1.01]"
          />
        </div>
        <h3 className="mt-5 text-body-lg text-ink">{product.title}</h3>
        <p className="mt-1 text-caption text-muted">
          {note ??
            (product.price != null ? `${product.currency ?? "JPY"} ${product.price.toLocaleString()}` : "")}
        </p>
      </Link>
    </article>
  );
}
