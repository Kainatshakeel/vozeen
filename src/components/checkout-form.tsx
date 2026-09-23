"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "./cart-provider";
import { formatMoney } from "./product-card";
import { totals } from "@/lib/validation";
type Address = {
  id: string;
  name: string;
  phone: string;
  line1: string;
  city: string;
  postalCode: string;
};
export function CheckoutForm({
  methods,
  addresses = [],
  email = "",
}: {
  methods: Record<string, boolean>;
  addresses?: Address[];
  email?: string;
}) {
  const { items } = useCart();
  const [method, setMethod] = useState("COD");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [coupon, setCoupon] = useState("");
  const [percent, setPercent] = useState(0);
  const [address, setAddress] = useState<Address | undefined>();
  const [key, setKey] = useState("");
  useEffect(() => {
    let value = sessionStorage.getItem("vozeen-checkout-key");
    if (!value) {
      value = crypto.randomUUID();
      sessionStorage.setItem("vozeen-checkout-key", value);
    }
    setKey(value);
    setCoupon(sessionStorage.getItem("vozeen-coupon") || "");
  }, []);
  const values = totals(
    items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    percent,
  );
  async function checkCoupon() {
    setError("");
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
    } catch (e) {
      setPercent(0);
      setError(e instanceof Error ? e.message : "Code unavailable.");
    }
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          shipping: {
            name: form.get("name"),
            phone: form.get("phone"),
            line1: form.get("line1"),
            city: form.get("city"),
            postalCode: form.get("postalCode"),
          },
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          coupon: coupon || undefined,
          paymentMethod: method,
          idempotencyKey: key,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      if (body.form) {
        const redirect = document.createElement("form");
        redirect.method = "POST";
        redirect.action = body.form.action;
        Object.entries(body.form.fields as Record<string, string>).forEach(
          ([name, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = name;
            input.value = value;
            redirect.appendChild(input);
          },
        );
        document.body.appendChild(redirect);
        redirect.submit();
      } else window.location.assign(body.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to place your order.");
      setBusy(false);
    }
  }
  if (!items.length)
    return (
      <div className="empty-state" style={{ marginBottom: 70 }}>
        <h2>Your bag is waiting.</h2>
        <p>Add a piece to your bag before checking out.</p>
        <Link className="button" href="/shop">
          Shop the collection ↗
        </Link>
      </div>
    );
  return (
    <form className="checkout-layout" onSubmit={submit}>
      <div>
        <section className="checkout-section">
          <h2>01 — Your details</h2>
          <label>
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={email}
              required
            />
          </label>
          {!email && (
            <p className="small-note">
              No account needed. Checking out as a guest? Your confirmation page
              shows an order ID and tracking key to follow your order.{" "}
              <Link href="/login" style={{ textDecoration: "underline" }}>
                Sign in
              </Link>{" "}
              to use saved addresses.
            </p>
          )}
        </section>
        <section className="checkout-section">
          <h2>02 — A place to call home</h2>
          {addresses.length > 0 && (
            <label>
              Saved address
              <select
                value={address?.id || ""}
                onChange={(e) =>
                  setAddress(addresses.find((a) => a.id === e.target.value))
                }
              >
                <option value="">Use a new address</option>
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {a.city}, {a.line1}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="form-grid" key={address?.id || "new"}>
            <label className="full">
              Full name
              <input
                name="name"
                autoComplete="name"
                defaultValue={address?.name}
                required
                minLength={2}
              />
            </label>
            <label>
              Mobile number
              <input
                name="phone"
                type="tel"
                placeholder="03001234567"
                autoComplete="tel"
                defaultValue={address?.phone}
                required
                pattern="(\+92|0)3[0-9]{9}"
              />
            </label>
            <label>
              Country
              <input value="Pakistan" readOnly />
            </label>
            <label className="full">
              Street address
              <input
                name="line1"
                placeholder="House, street, neighborhood"
                autoComplete="street-address"
                defaultValue={address?.line1}
                minLength={8}
                required
              />
            </label>
            <label>
              City
              <input
                name="city"
                autoComplete="address-level2"
                defaultValue={address?.city}
                required
              />
            </label>
            <label>
              Postal code
              <input
                name="postalCode"
                inputMode="numeric"
                pattern="[0-9]{5}"
                autoComplete="postal-code"
                defaultValue={address?.postalCode}
                required
              />
            </label>
          </div>
        </section>
        <section className="checkout-section">
          <h2>03 — The finishing touch</h2>
          <div className="payment-options">
            {Object.entries({
              COD: "Cash on delivery",
              JAZZCASH: "JazzCash",
              EASYPAISA: "EasyPaisa",
              CARD: "Debit / credit card",
            }).map(([value, label]) => (
              <label className="payment-option" key={value}>
                <input
                  type="radio"
                  name="payment"
                  checked={method === value}
                  onChange={() => setMethod(value)}
                  disabled={!methods[value]}
                />
                <span>
                  {label}
                  {!methods[value] && (
                    <small className="coming-soon">Coming soon</small>
                  )}
                </span>
              </label>
            ))}
          </div>
          <p className="small-note">
            Online payments are completed on the payment provider’s secure page.
            We never collect or store your card details.
          </p>
        </section>
      </div>
      <aside className="panel order-summary">
        <h2>Order summary</h2>
        {items.map((i) => (
          <div className="summary-row" key={i.variantId}>
            <span>
              {i.name} × {i.quantity}
              <small className="small-note" style={{ marginTop: 2 }}>
                {i.color} / {i.size}
              </small>
            </span>
            <span>{formatMoney(i.price * i.quantity)}</span>
          </div>
        ))}
        <div className="summary-row">
          <span>Subtotal</span>
          <span>{formatMoney(values.subtotal)}</span>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <span>
            {values.shippingFee ? formatMoney(values.shippingFee) : "On us"}
          </span>
        </div>
        {values.discount > 0 && (
          <div className="summary-row">
            <span>Discount</span>
            <span>− {formatMoney(values.discount)}</span>
          </div>
        )}
        <div className="inline-form" style={{ margin: "15px 0" }}>
          <input
            aria-label="Promo code"
            placeholder="Promo code"
            value={coupon}
            onChange={(e) => {
              setCoupon(e.target.value.toUpperCase());
              setPercent(0);
            }}
          />
          <button
            type="button"
            className="button button-outline"
            onClick={checkCoupon}
          >
            Apply
          </button>
        </div>
        <div className="summary-row total">
          <span>Estimated total</span>
          <span>{formatMoney(values.total)}</span>
        </div>
        <p className="small-note">
          Prices and promotions are verified when you place your order.
        </p>
        {error && (
          <div className="alert" role="alert">
            {error}
          </div>
        )}
        <button
          className="button"
          style={{ width: "100%", marginTop: 18 }}
          disabled={busy || !key}
        >
          {busy
            ? "Preparing your order…"
            : method === "COD"
              ? "Place order →"
              : "Continue to payment →"}
        </button>
        <p className="small-note">
          By placing your order you agree to our{" "}
          <Link href="/shipping" style={{ textDecoration: "underline" }}>
            shipping
          </Link>{" "}
          and{" "}
          <Link href="/returns" style={{ textDecoration: "underline" }}>
            return policies
          </Link>
          .
        </p>
      </aside>
    </form>
  );
}
