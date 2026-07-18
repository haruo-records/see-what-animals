import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products, getProductBySlug } from "@/data/products";
import { getSessionById } from "@/data/observation-sessions";
import { siteSettings } from "@/data/site-settings";
import { PageShell } from "@/components/layout/page-shell";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductInformation } from "@/components/shop/product-information";
import { TextLink } from "@/components/ui/text-link";
import { Divider } from "@/components/ui/divider";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return {};
  return { title: product.title, description: product.description };
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const relatedObservations = (product.relatedObservationIds ?? [])
    .map((id) => getSessionById(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    url: `${siteSettings.siteUrl}/shop/${product.slug}`,
    ...(product.price != null
      ? {
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: product.currency ?? "JPY",
            availability:
              product.availability === "available"
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
          },
        }
      : {}),
  };

  return (
    <section className="py-18">
      <PageShell width="work">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <ProductGallery images={product.images} title={product.title} />
          <ProductInformation product={product} />
        </div>

        {relatedObservations.length > 0 ? (
          <>
            <Divider className="my-16" />
            <p className="u-label mb-6">From the observation</p>
            <div className="flex flex-col gap-3">
              {relatedObservations.map((s) => (
                <TextLink key={s.id} href={`/observations/${s.slug}`}>
                  Observation {s.observationNumber}
                </TextLink>
              ))}
            </div>
          </>
        ) : null}

        <Divider className="my-16" />
        <TextLink href="/shop">Back to shop</TextLink>
      </PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
