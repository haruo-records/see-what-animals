import type { Product } from "@/types";
import { PurchaseLink } from "./purchase-link";
import { Divider } from "@/components/ui/divider";

const categoryLabel: Record<Product["category"], string> = {
  object: "Object",
  "paper-study": "Paper Study",
  print: "Edition Print",
  book: "Book",
  "field-note": "Field Notes",
  card: "Cards",
  digital: "Digital Download",
};

function price(product: Product): string | null {
  if (product.price == null) return null;
  const currency = product.currency ?? "JPY";
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency }).format(product.price);
  } catch {
    return `${product.price} ${currency}`;
  }
}

/** Museum-object information, treated as a small work rather than merchandise. */
export function ProductInformation({ product }: { product: Product }) {
  const rows: [string, string | undefined][] = [
    ["Material", product.material],
    ["Dimensions", product.dimensions],
    ["Edition", product.edition],
  ];
  const p = price(product);
  return (
    <div>
      <p className="u-label">{categoryLabel[product.category]}</p>
      <h1 className="mt-4 text-h1 font-normal text-ink">{product.title}</h1>
      <p className="mt-6 max-w-reading text-body-lg text-charcoal">{product.description}</p>

      <Divider className="my-10" />

      <dl className="flex flex-col gap-4">
        {rows
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="grid grid-cols-[120px_1fr] gap-4">
              <dt className="u-label">{k}</dt>
              <dd className="text-body text-charcoal">{v}</dd>
            </div>
          ))}
      </dl>

      <Divider className="my-10" />

      <div className="flex items-center justify-between">
        {p ? <span className="text-h3 text-ink">{p}</span> : <span />}
        <PurchaseLink product={product} />
      </div>
    </div>
  );
}
