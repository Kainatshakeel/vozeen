import Link from "next/link";
import { getProducts } from "@/lib/catalog";
import { Catalog } from "@/components/catalog";
export const dynamic = "force-dynamic";
export const metadata = { title: "Shop the collection" };
export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; q?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="shop-page">
      <div className="shop-heading">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / <Link href="/shop">Shop</Link>
          {params.category && <> / {params.category}</>}
        </div>
        <h1>{params.category || "The collection"}</h1>
      </div>
      <Catalog
        key={JSON.stringify(params)}
        products={await getProducts()}
        initialCategory={params.category}
        initialSort={params.sort}
        query={params.q}
      />
    </div>
  );
}
