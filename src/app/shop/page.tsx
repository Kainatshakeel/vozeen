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
    <div className="container">
      <div className="page-heading">
        <div className="breadcrumb">Home / The collection</div>
        <div className="eyebrow muted">EASTERN WEAR</div>
        <h1>{params.category || "The collection"}</h1>
        <p>Lawn, chikankari, kurta shalwar and formals, crafted in Pakistan.</p>
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
