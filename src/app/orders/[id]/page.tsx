import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, Package } from "lucide-react";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { money } from "@/lib/catalog";
import { OrderTracking } from "@/components/order-tracking";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  if (!process.env.DATABASE_URL) notFound();
  const { id } = await params;
  const { token } = await searchParams;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();
  if (token !== order.trackingToken) {
    const user = await currentUser();
    if (!user || (order.userId !== user.id && user.role !== "ADMIN"))
      notFound();
  }
  const steps = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
  const index = steps.indexOf(order.status);
  return (
    <div className="container content-page">
      <OrderTracking
        idempotencyKey={order.idempotencyKey}
        poll={order.status !== "DELIVERED" && order.status !== "CANCELLED"}
      />
      <Package size={30} style={{ marginBottom: 25 }} />
      <p className="eyebrow muted">THANK YOU FOR CHOOSING VOZEEN</p>
      <h1>
        {order.status === "CANCELLED"
          ? "Order cancelled."
          : order.paymentMethod !== "COD" && order.paymentStatus !== "PAID"
            ? "Your order is reserved."
            : "Good things are on their way."}
      </h1>
      <p>
        Order <strong>{order.id}</strong>
      </p>
      <p>
        {order.paymentMethod === "COD"
          ? "Payment is due on delivery."
          : order.paymentStatus === "PAID"
            ? "Your payment is confirmed."
            : "We are waiting for payment confirmation. This page updates automatically."}
      </p>
      <div className="tracking-steps">
        {steps.map((step, i) => (
          <div
            key={step}
            className={`tracking-step ${i <= index ? "complete" : ""}`}
          >
            {i <= index && <Check size={14} style={{ marginBottom: 8 }} />}
            {step.charAt(0) + step.slice(1).toLowerCase()}
          </div>
        ))}
      </div>
      <div className="panel">
        {order.items.map((i) => (
          <div className="summary-row" key={i.id}>
            <span>
              {i.name} × {i.quantity}
              <span className="small-note">
                {i.size} / {i.color}
              </span>
            </span>
            <span>{money(i.price * i.quantity)}</span>
          </div>
        ))}
        <div className="summary-row">
          <span>Shipping</span>
          <span>{money(order.shippingFee)}</span>
        </div>
        <div className="summary-row">
          <span>Discount</span>
          <span>− {money(order.discount)}</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>{money(order.total)}</span>
        </div>
      </div>
      <div className="panel">
        <div className="summary-row">
          <span>Order ID</span>
          <strong>{order.id}</strong>
        </div>
        <div className="summary-row">
          <span>Tracking key</span>
          <strong style={{ wordBreak: "break-all" }}>
            {order.trackingToken}
          </strong>
        </div>
      </div>
      <p className="small-note">
        Save this page, or note your order ID and tracking key, to check your
        order’s progress at{" "}
        <Link href="/track" style={{ textDecoration: "underline" }}>
          Track your order
        </Link>
        . Keep your tracking key private.
      </p>
      <Link href="/shop" className="button" style={{ marginTop: 20 }}>
        Back to the collection ↗
      </Link>
    </div>
  );
}
