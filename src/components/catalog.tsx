"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { ProductCard, formatMoney } from "./product-card";
const PER_PAGE = 12;
export function Catalog({
  products,
  initialCategory = "",
  initialSort = "featured",
  query = "",
}: {
  products: Product[];
  initialCategory?: string;
  initialSort?: string;
  query?: string;
}) {
  const [category, setCategory] = useState(initialCategory);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [fabric, setFabric] = useState("");
  const [pieceType, setPieceType] = useState("");
  const [work, setWork] = useState("");
  const facet = (key: "fabric" | "pieceType" | "work") =>
    [
      ...new Set(products.map((p) => p[key]).filter((v): v is string => !!v)),
    ].sort();
  // Slider ceiling follows the catalog so high-value formals are never hidden by default.
  const maxPrice = Math.max(
    15000,
    Math.ceil(Math.max(0, ...products.map((p) => p.price)) / 100000) * 1000,
  );
  const colors = [
    ...new Set(products.flatMap((p) => p.variants.map((v) => v.color))),
  ].sort();
  const [price, setPrice] = useState(maxPrice);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const active =
    [category, size, color, fabric, pieceType, work].filter(Boolean).length +
    (price < maxPrice ? 1 : 0);
  const filtered = products
    .filter(
      (p) =>
        (!category || p.category === category) &&
        (!query ||
          `${p.name} ${p.category} ${p.fabric} ${p.work} ${p.description}`
            .toLowerCase()
            .includes(query.toLowerCase())) &&
        p.price <= price * 100 &&
        (!fabric || p.fabric === fabric) &&
        (!pieceType || p.pieceType === pieceType) &&
        (!work || p.work === work) &&
        p.variants.some(
          (v) => (!size || v.size === size) && (!color || v.color === color),
        ),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : sort === "featured"
            ? Number(b.featured) - Number(a.featured)
            : 0,
    );
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  function reset() {
    setCategory("");
    setSize("");
    setColor("");
    setFabric("");
    setPieceType("");
    setWork("");
    setPrice(maxPrice);
    setPage(1);
    router.push("/shop");
  }
  return (
    <>
      <div className="catalog-toolbar">
        <button
          type="button"
          className="filter-toggle"
          aria-expanded={showFilters}
          aria-controls="catalog-filters"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={18} />
          Filters{active > 0 && <span>{active}</span>}
        </button>
        <p>
          {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}{" "}
          {query && `for “${query}”`}
        </p>
        <label>
          Sort by{" "}
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="new">New arrivals</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </label>
      </div>
      <div className="catalog-layout">
        <aside
          id="catalog-filters"
          className={showFilters ? "catalog-filters open" : "catalog-filters"}
          aria-label="Product filters"
        >
          <div className="filter-block">
            <h3>Category</h3>
            {["", "Women", "Men", "Formals"].map((c) => (
              <label key={c}>
                <input
                  type="checkbox"
                  checked={category === c}
                  onChange={() => {
                    setCategory(c);
                    setPage(1);
                  }}
                />
                {c || "All pieces"}
              </label>
            ))}
          </div>
          <div className="filter-block">
            <h3>Size</h3>
            <div className="size-options">
              {["XS", "S", "M", "L", "XL"].map((s) => (
                <button
                  key={s}
                  className={size === s ? "selected" : ""}
                  onClick={() => setSize(size === s ? "" : s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-block">
            <h3>Color</h3>
            {colors.map((c) => (
              <label key={c}>
                <input
                  type="checkbox"
                  checked={color === c}
                  onChange={() => setColor(color === c ? "" : c)}
                />
                {c}
              </label>
            ))}
          </div>
          {(
            [
              ["Pieces", facet("pieceType"), pieceType, setPieceType],
              ["Type", facet("work"), work, setWork],
              ["Fabric", facet("fabric"), fabric, setFabric],
            ] as const
          ).map(
            ([title, values, value, set]) =>
              values.length > 0 && (
                <div className="filter-block" key={title}>
                  <h3>{title}</h3>
                  {values.map((v) => (
                    <label key={v}>
                      <input
                        type="checkbox"
                        checked={value === v}
                        onChange={() => {
                          set(value === v ? "" : v);
                          setPage(1);
                        }}
                      />
                      {v}
                    </label>
                  ))}
                </div>
              ),
          )}
          <div className="filter-block">
            <h3>Price — up to {formatMoney(price * 100)}</h3>
            <input
              aria-label="Maximum price"
              type="range"
              min="1000"
              max={maxPrice}
              step="1000"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>
          <button type="button" className="reset-filters" onClick={reset}>
            Reset filters <ArrowUpRight size={16} />
          </button>
        </aside>
        <div>
          {filtered.length ? (
            <div className="product-grid">
              {filtered
                .slice((current - 1) * PER_PAGE, current * PER_PAGE)
                .map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>A fresh start?</h2>
              <p>No pieces match these filters. Try a different combination.</p>
              <button className="button" onClick={reset}>
                Clear filters
              </button>
            </div>
          )}
          {pages > 1 && (
            <nav className="pagination" aria-label="Catalog pages">
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  className={current === i + 1 ? "selected" : ""}
                  aria-current={current === i + 1 ? "page" : undefined}
                  onClick={() => {
                    setPage(i + 1);
                    window.scrollTo({ top: 200, behavior: "smooth" });
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
