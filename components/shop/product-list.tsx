import type { Product } from "@/types";
import { ProductItem } from "./product-item";

export function ProductList({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductItem key={p.id} product={p} />
      ))}
    </div>
  );
}
