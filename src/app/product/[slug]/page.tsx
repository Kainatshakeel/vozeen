import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/catalog";
import { ProductDetail } from "@/components/product-detail";
import { ProductCard } from "@/components/product-card";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await getProduct((await params).slug);
  return {
    title: p?.name || "Product not found",
    description: p?.description,
    openGraph: { images: p?.images.slice(0, 1) },
  };
}
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await getProduct((await params).slug);
  if (!p) notFound();
  const related = (await getProducts())
    .filter((item) => item.id !== p.id)
    .slice(0, 4);
  return (
    <div className="container">
      <div className="page-heading">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / {p.name}
        </div>
      </div>
      <ProductDetail product={p} />
      <section className="section">
        <div className="section-heading">
          <h2>Better together.</h2>
          <Link className="text-link" href="/shop">
            Explore all pieces ↗
          </Link>
        </div>
        <div className="product-grid">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.name,
            description: p.description,
            image: p.images.map(
              (src) =>
                new URL(
                  src,
                  process.env.NEXT_PUBLIC_SITE_URL || "https://vozeen.com",
                ).href,
            ),
            offers: {
              "@type": "Offer",
              priceCurrency: "PKR",
              price: p.price / 100,
              availability: p.variants.some((v) => v.stock > 0)
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://vozeen.com"}/product/${p.slug}`,
            },
          }).replace(/</g, "\u003c"),
        }}
      />
    </div>
  );
}
