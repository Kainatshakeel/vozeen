"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart, Plus, X } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { useCart } from "./cart-provider";
// Format client-side without importing the database-backed catalog module.
export const formatMoney = (n: number) =>
  `Rs. ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(n / 100)}`;
const swatches: Record<string, string> = {
  lemon: "#f1e3a0",
  crimson: "#9b1b2a",
  lilac: "#b9a7d4",
  lavender: "#a58fc4",
  mint: "#a9d8c6",
  blush: "#f0c4bd",
  marigold: "#f2a93b",
  butter: "#f3e3a6",
  plum: "#5b2340",
  white: "#ffffff",
  charcoal: "#3b3f44",
  "royal blue": "#23479b",
  pistachio: "#bcd4a4",
  "slate grey": "#8a9199",
  scarlet: "#b3122b",
  peacock: "#136b7a",
  black: "#1f1f1f",
  ivory: "#f4efe2",
  maroon: "#6e1f2e",
  gold: "#c9a24a",
  green: "#2f6b4f",
  navy: "#1f2d4d",
  pink: "#e8a3b5",
  red: "#c0392b",
  blue: "#2f5fa7",
  yellow: "#f2d04b",
  beige: "#dccab0",
  grey: "#9aa0a6",
};
// Unknown admin-entered colour names fall back to a neutral swatch.
const swatch = (color: string) =>
  swatches[color.trim().toLowerCase()] || "#d8d2c7";
export function ProductCard({
  product: p,
  index = 0,
  initialSaved = false,
}: {
  product: Product;
  index?: number;
  initialSaved?: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [message, setMessage] = useState("");
  const [picking, setPicking] = useState(false);
  const { add, openDrawer } = useCart();
  const colors = [...new Set(p.variants.map((v) => v.color))];
  // Quick add works for single-colour pieces; others need the product page.
  const sizes = colors.length === 1 ? p.variants : [];
  function quickAdd(variant: Product["variants"][number]) {
    add({
      variantId: variant.id,
      slug: p.slug,
      name: p.name,
      image: p.images[0],
      size: variant.size,
      color: variant.color,
      price: p.price,
      quantity: 1,
    });
    setPicking(false);
    openDrawer();
  }
  async function save() {
    const response = await fetch("/api/account/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: p.id }),
    });
    if (response.ok) {
      const result = await response.json();
      setSaved(result.saved);
    } else
      setMessage(
        response.status === 401
          ? "Sign in to save favorites"
          : "Connect the database to save favorites",
      );
  }
  return (
    <article className="product-card">
      <div className="product-image">
        <Link
          className="product-image-link"
          href={`/product/${p.slug}`}
          tabIndex={-1}
          aria-hidden="true"
        >
          <Image
            src={p.images[0]}
            alt={p.name}
            fill
            sizes="(max-width: 650px) 50vw, (max-width: 1000px) 33vw, 25vw"
          />
        </Link>
        <span className={`product-badge ${p.compareAt ? "sale" : ""}`}>
          {p.compareAt
            ? "SALE"
            : p.category === "Formals"
              ? "FORMAL"
              : index % 3 === 0
                ? "BESTSELLER"
                : "NEW"}
        </span>
        <button
          className={`wish-button ${saved ? "saved" : ""}`}
          onClick={save}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        >
          <Heart size={17} fill={saved ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          className="quick-add-toggle"
          aria-expanded={picking}
          aria-label={picking ? "Close sizes" : `Quick add ${p.name}`}
          onClick={() => setPicking(!picking)}
        >
          {picking ? <X size={18} /> : <Plus size={18} />}
        </button>
        <div
          className={picking ? "quick-add open" : "quick-add"}
          role="group"
          aria-label={`Choose a size for ${p.name}`}
        >
          {sizes.length ? (
            <>
              <p>Quick add · select size</p>
              <div>
                {sizes.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    disabled={v.stock < 1}
                    aria-label={`Add ${p.name}, size ${v.size}, to bag`}
                    onClick={() => quickAdd(v)}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <Link href={`/product/${p.slug}`}>Choose colour & size</Link>
          )}
        </div>
      </div>
      <div className="product-meta">
        <p>
          {[p.pieceType, p.fabric].filter(Boolean).join(" · ") || p.category}
        </p>
        <Link href={`/product/${p.slug}`}>
          <h3>{p.name}</h3>
        </Link>
        <div className="product-price">
          {formatMoney(p.price)}{" "}
          {p.compareAt && <del>{formatMoney(p.compareAt)}</del>}
        </div>
        <div className="swatches">
          {[...new Set(p.variants.map((v) => v.color))].map((c) => (
            <i key={c} title={c} style={{ background: swatch(c) }} />
          ))}
        </div>
        {message && (
          <Link className="small-note" href="/login">
            {message}
          </Link>
        )}
      </div>
    </article>
  );
}
