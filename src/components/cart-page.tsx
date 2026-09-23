"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, ArrowUpRight, ShoppingBag } from "lucide-react";
import { useCart } from "./cart-provider";
import { formatMoney } from "./product-card";
import { totals } from "@/lib/validation";
export function CartPage() {
  const { items, update } = useCart();
  const [coupon, setCoupon] = useState("");
  const [percent, setPercent] = useState(0);
  const [message, setMessage] = useState("");
  const values = totals(
    items.reduce((s, i) => s + i.price * i.quantity, 0),
    percent,
  );
  async function apply() {
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: coupon,
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setPercent(body.percent);
      sessionStorage.setItem("vozeen-coupon", coupon);
      setMessage(
        "Your code has been applied. Eligibility is checked again at checkout.",
      );
    } catch (e) {
      setPercent(0);
      sessionStorage.removeItem("vozeen-coupon");
      setMessage(e instanceof Error ? e.message : "Unable to apply code.");
    }
  }
  if (!items.length)
    return (
      <div className="empty-state" style={{ marginBottom: 70 }}>
        <ShoppingBag size={30} style={{ margin: "0 auto 25px" }} />
        <h2>A little room for something good.</h2>
        <p>Your bag is empty. Find your next favourite.</p>
        <Link className="button" href="/shop">
          Explore the collection <ArrowUpRight size={17} />
        </Link>
      </div>
    );
  return (
    <div className="checkout-layout">
      <div>
        {items.map((i) => (
          <div className="cart-line" key={i.variantId}>
            <Link href={`/product/${i.slug}`} className="cart-line-image">
              <Image src={i.image} alt={i.name} fill sizes="85px" />
            </Link>
            <div>
              <Link href={`/product/${i.slug}`}>
                <h3>{i.name}</h3>
              </Link>
              <p>
                {i.color} / {i.size}
              </p>
              <div className="quantity-control">
                <button
                  aria-label={`Decrease ${i.name} quantity`}
                  onClick={() => update(i.variantId, i.quantity - 1)}
                >
                  <Minus size={12} />
                </button>
                {i.quantity}
                <button
                  aria-label={`Increase ${i.name} quantity`}
                  onClick={() => update(i.variantId, i.quantity + 1)}
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
            <div>
              {formatMoney(i.price * i.quantity)}
              <button
                className="remove-button"
                onClick={() => update(i.variantId, 0)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <Link className="text-link" style={{ marginTop: 25 }} href="/shop">
          Continue exploring ↗
        </Link>
      </div>
      <aside className="panel order-summary">
        <h2>Order summary</h2>
        <div className="summary-row">
          <span>Subtotal</span>
          <span>{formatMoney(values.subtotal)}</span>
        </div>
        {values.discount > 0 && (
          <div className="summary-row">
            <span>Discount</span>
            <span>− {formatMoney(values.discount)}</span>
          </div>
        )}
        <div className="summary-row">
          <span>Shipping</span>
          <span>
            {values.shippingFee ? formatMoney(values.shippingFee) : "On us"}
          </span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>{formatMoney(values.total)}</span>
        </div>
        <form
          className="inline-form"
          style={{ margin: "20px 0" }}
          onSubmit={(e) => {
            e.preventDefault();
            apply();
          }}
        >
          <input
            aria-label="Promo code"
            value={coupon}
            onChange={(e) => {
              setCoupon(e.target.value.toUpperCase());
              setPercent(0);
              sessionStorage.removeItem("vozeen-coupon");
            }}
            placeholder="Have a promo code?"
          />
          <button className="button button-outline">Apply</button>
        </form>
        {message && (
          <p className="small-note" role="status">
            {message}
          </p>
        )}
        <Link className="button" style={{ width: "100%" }} href="/checkout">
          Continue to checkout <ArrowUpRight size={17} />
        </Link>
        <p className="small-note">
          Final prices and availability are confirmed at checkout.
        </p>
      </aside>
    </div>
  );
}
