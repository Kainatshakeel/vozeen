"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "./cart-provider";
import { formatMoney } from "./product-card";
import { totals } from "@/lib/validation";

const FREE_SHIPPING = 1500000;

export function CartDrawer() {
  const { items, update, drawerOpen, closeDrawer } = useCart();
  const closeButton = useRef<HTMLButtonElement>(null);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const { shippingFee } = totals(subtotal);
  const remaining = FREE_SHIPPING - subtotal;

  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    closeButton.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <div
      className={drawerOpen ? "cart-drawer open" : "cart-drawer"}
      aria-hidden={!drawerOpen}
      inert={!drawerOpen}
    >
      <div className="cart-drawer-backdrop" onClick={closeDrawer} />
      <aside
        className="cart-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        <div className="cart-drawer-head">
          <h2 id="cart-drawer-title">
            Your bag <span>({items.reduce((s, i) => s + i.quantity, 0)})</span>
          </h2>
          <button
            ref={closeButton}
            type="button"
            className="icon-button"
            aria-label="Close bag"
            onClick={closeDrawer}
          >
            <X size={22} />
          </button>
        </div>
        {items.length ? (
          <>
            <p className="cart-drawer-shipping">
              {remaining > 0
                ? `Add ${formatMoney(remaining)} more for free delivery.`
                : "Your order ships free."}
              <i
                style={{
                  width: `${Math.min(100, (subtotal / FREE_SHIPPING) * 100)}%`,
                }}
              />
            </p>
            <ul className="cart-drawer-items">
              {items.map((i) => (
                <li key={i.variantId}>
                  <Link
                    href={`/product/${i.slug}`}
                    className="cart-drawer-image"
                    onClick={closeDrawer}
                  >
                    <Image src={i.image} alt={i.name} fill sizes="90px" />
                  </Link>
                  <div>
                    <Link href={`/product/${i.slug}`} onClick={closeDrawer}>
                      <h3>{i.name}</h3>
                    </Link>
                    <p>
                      Size {i.size} · {i.color}
                    </p>
                    <div className="cart-drawer-row">
                      <div className="quantity-control">
                        <button
                          type="button"
                          aria-label={`Decrease ${i.name} quantity`}
                          onClick={() => update(i.variantId, i.quantity - 1)}
                        >
                          <Minus size={14} />
                        </button>
                        {i.quantity}
                        <button
                          type="button"
                          aria-label={`Increase ${i.name} quantity`}
                          onClick={() => update(i.variantId, i.quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <strong>{formatMoney(i.price * i.quantity)}</strong>
                    </div>
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => update(i.variantId, 0)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cart-drawer-foot">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <span>{shippingFee ? formatMoney(shippingFee) : "Free"}</span>
              </div>
              <Link className="button" href="/checkout" onClick={closeDrawer}>
                Checkout
              </Link>
              <Link
                className="button button-outline"
                href="/cart"
                onClick={closeDrawer}
              >
                View bag
              </Link>
            </div>
          </>
        ) : (
          <div className="cart-drawer-empty">
            <ShoppingBag size={32} />
            <p>Your bag is empty.</p>
            <Link className="button" href="/shop" onClick={closeDrawer}>
              Shop the collection
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
