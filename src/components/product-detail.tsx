"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Minus, Plus, Ruler, ShoppingBag, Truck, X } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { chartSetFor } from "@/lib/size-charts";
import { SizeChart } from "./size-chart";
import { useCart } from "./cart-provider";
import { formatMoney } from "./product-card";
export function ProductDetail({ product: p }: { product: Product }) {
  const [image, setImage] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState(p.variants[0]?.color || "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const chartDialog = useRef<HTMLDialogElement>(null);
  const subtitle = [p.pieceType, p.work, p.fabric].filter(Boolean).join(" · ");
  const { add, openDrawer } = useCart();
  const variant = p.variants.find((v) => v.size === size && v.color === color);
  return (
    <div className="detail-layout">
      <div>
        <div className="gallery-main">
          <Image
            src={p.images[image]}
            alt={`${p.name}, view ${image + 1}`}
            fill
            priority
            sizes="(max-width: 650px) 100vw, 55vw"
          />
        </div>
        <div className="gallery-thumbs">
          {p.images.map((src, i) => (
            <button
              key={i}
              aria-label={`Show image ${i + 1}`}
              aria-pressed={image === i}
              onClick={() => setImage(i)}
            >
              <Image src={src} alt={`${p.name} thumbnail`} fill sizes="70px" />
            </button>
          ))}
        </div>
      </div>
      <div className="detail-info">
        <p className="eyebrow muted">
          {p.category === "Formals"
            ? "Formals"
            : `${p.category} · Ready to wear`}
        </p>
        <h1>{p.name}</h1>
        {subtitle && <p className="detail-subtitle">{subtitle}</p>}
        <div className="price">
          {formatMoney(p.price)}{" "}
          {p.compareAt && (
            <del className="small-note">{formatMoney(p.compareAt)}</del>
          )}
        </div>
        <p className="detail-description">{p.description}</p>
        <div className="detail-option">
          <div>
            <span>Color: {color}</span>
          </div>
          <div className="size-options">
            {[...new Set(p.variants.map((v) => v.color))].map((c) => (
              <button
                key={c}
                className={color === c ? "selected" : ""}
                onClick={() => {
                  setColor(c);
                  setAdded(false);
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="detail-option">
          <div>
            <span>Select a size {size && `— ${size}`}</span>
            <button
              type="button"
              className="size-chart-link"
              onClick={() => chartDialog.current?.showModal()}
            >
              <Ruler size={16} /> Size chart
            </button>
          </div>
          <div className="size-options">
            {[...new Set(p.variants.map((v) => v.size))].map((s) => (
              <button
                key={s}
                disabled={
                  !p.variants.some(
                    (v) => v.size === s && v.color === color && v.stock > 0,
                  )
                }
                onClick={() => {
                  setSize(s);
                  setAdded(false);
                }}
                className={size === s ? "selected" : ""}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="purchase-row">
          <div className="quantity-control">
            <button
              aria-label="Decrease quantity"
              onClick={() => setQty(Math.max(1, qty - 1))}
            >
              <Minus size={13} />
            </button>
            {qty}
            <button
              aria-label="Increase quantity"
              onClick={() =>
                setQty(Math.min(10, variant?.stock || 10, qty + 1))
              }
            >
              <Plus size={13} />
            </button>
          </div>
          <button
            className="button"
            disabled={!variant || variant.stock < qty}
            onClick={() => {
              if (variant) {
                add({
                  variantId: variant.id,
                  slug: p.slug,
                  name: p.name,
                  image: p.images[0],
                  size,
                  color,
                  price: p.price,
                  quantity: qty,
                });
                setAdded(true);
                openDrawer();
              }
            }}
          >
            {added
              ? "Added to your bag"
              : !size
                ? "Select your size"
                : "Add to bag"}
            <ShoppingBag size={16} />
          </button>
        </div>
        {added && (
          <Link className="small-note" href="/cart">
            Added to your bag. View bag →
          </Link>
        )}
        <p className="small-note">
          <Truck size={13} style={{ display: "inline", marginRight: 6 }} />
          Free shipping over Rs. 15,000 · Cash on delivery available
        </p>
        <details open>
          <summary>Details</summary>
          <div className="piece-list">
            {p.fit && <p className="piece-fit">{p.fit}</p>}
            {p.pieces.map((piece) => (
              <dl key={piece.name}>
                <dt>{piece.name}</dt>
                <dd>
                  <span>Colour</span> {piece.colour}
                </dd>
                <dd>
                  <span>Fabric</span> {piece.fabric}
                </dd>
              </dl>
            ))}
            <p className="small-note">
              Note: actual product colour may vary slightly from the image.
              Hand-finished embroidery means small variations are part of each
              piece.
            </p>
          </div>
        </details>
        <details>
          <summary>Care for your piece</summary>
          <p>
            Dry clean embroidered and formal pieces. Hand wash lawn and cotton
            separately in cold water, dry in shade, and iron on the reverse away
            from embellishments.
          </p>
        </details>
        <details>
          <summary>Shipping & returns</summary>
          <p>
            Delivery across Pakistan. Eligible unworn items may be returned
            within 14 days. <Link href="/returns">Read our policy →</Link>
          </p>
        </details>
      </div>
      <dialog
        ref={chartDialog}
        className="size-dialog"
        aria-labelledby="size-dialog-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) chartDialog.current?.close();
        }}
      >
        <div className="size-dialog-head">
          <h2 id="size-dialog-title">Size chart</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Close size chart"
            onClick={() => chartDialog.current?.close()}
          >
            <X size={22} />
          </button>
        </div>
        <p className="small-note">{p.name}</p>
        <SizeChart set={chartSetFor(p.sizeChart, p.category)} />
        <Link className="text-link" href="/size-guide">
          How to measure →
        </Link>
      </dialog>
    </div>
  );
}
