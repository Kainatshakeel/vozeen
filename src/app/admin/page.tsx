import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { money, parsePieces } from "@/lib/catalog";
import {
  ProductManager,
  CouponManager,
  OrderStatus,
} from "@/components/admin-manager";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Studio dashboard",
  robots: { index: false, follow: false },
};
export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = process.env.DATABASE_URL ? await currentUser() : null;
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/account");
  const { tab = "overview" } = await searchParams;
  const [orders, products, customers, coupons] = await Promise.all([
    db.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    db.product.findMany({
      include: { variants: true },
      orderBy: { createdAt: "desc" },
    }),
    db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    db.coupon.findMany({ orderBy: { expiresAt: "desc" } }),
  ]);
  const paid = orders.filter((o) => o.paymentStatus === "PAID");
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - 5 + i);
    const month = date.getMonth();
    const year = date.getFullYear();
    return {
      name: date.toLocaleString("en", { month: "short" }),
      revenue: paid
        .filter(
          (o) =>
            o.createdAt.getMonth() === month &&
            o.createdAt.getFullYear() === year,
        )
        .reduce((s, o) => s + o.total, 0),
      orders: orders.filter(
        (o) =>
          o.createdAt.getMonth() === month &&
          o.createdAt.getFullYear() === year &&
          o.status !== "CANCELLED",
      ).length,
    };
  });
  const top = new Map<string, { name: string; quantity: number }>();
  for (const o of paid)
    for (const item of o.items) {
      const entry = top.get(item.name) || { name: item.name, quantity: 0 };
      entry.quantity += item.quantity;
      top.set(item.name, entry);
    }
  return (
    <div className="container" style={{ paddingBottom: 80 }}>
      <div className="page-heading">
        <p className="eyebrow muted">VOZEEN / BEHIND THE COLLECTION</p>
        <h1>The studio.</h1>
        <p>An overview of your store.</p>
      </div>
      <nav className="account-tabs">
        {["overview", "products", "orders", "customers", "coupons"].map((t) => (
          <Link
            key={t}
            href={`/admin?tab=${t}`}
            className={tab === t ? "active" : ""}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Link>
        ))}
      </nav>
      {tab === "overview" && (
        <>
          <div className="admin-stats">
            <div className="admin-stat">
              <p>Collected revenue</p>
              <strong>{money(revenue)}</strong>
            </div>
            <div className="admin-stat">
              <p>Orders</p>
              <strong>{orders.length}</strong>
            </div>
            <div className="admin-stat">
              <p>Customers</p>
              <strong>{customers.length}</strong>
            </div>
          </div>
          <div className="checkout-layout">
            <div className="panel">
              <h2>Revenue, over time</h2>
              <div className="chart-bars">
                {months.map((m) => (
                  <div
                    key={m.name}
                    title={`${m.name}: ${money(m.revenue)}`}
                    style={{
                      height: `${Math.max(2, (m.revenue / Math.max(1, ...months.map((m) => m.revenue))) * 100)}%`,
                    }}
                  >
                    <span>{m.name}</span>
                  </div>
                ))}
              </div>
              <div className="small-note">
                {months
                  .map((m) => `${m.name}: ${money(m.revenue)}`)
                  .join(" · ")}
              </div>
            </div>
            <div className="panel">
              <h2>The most-loved pieces</h2>
              {[...top.values()]
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5)
                .map((p) => (
                  <div className="summary-row" key={p.name}>
                    <span>{p.name}</span>
                    <span>{p.quantity} sold</span>
                  </div>
                ))}
              {!top.size && (
                <p className="small-note">
                  Your bestsellers will appear after the first paid order.
                </p>
              )}
            </div>
          </div>
          <div className="panel">
            <h2>Orders, over time</h2>
            <div className="chart-bars">
              {months.map((m) => (
                <div
                  key={m.name}
                  title={`${m.name}: ${m.orders} orders`}
                  style={{
                    height: `${Math.max(2, (m.orders / Math.max(1, ...months.map((m) => m.orders))) * 100)}%`,
                  }}
                >
                  <span>
                    {m.name} · {m.orders}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="small-note">
            Dashboard covers the latest 500 orders and 200 registered customers.
            Revenue includes paid orders only.
          </p>
        </>
      )}
      {tab === "products" && (
        <ProductManager
          products={products.map((p) => ({
            ...p,
            pieces: parsePieces(p.pieces),
          }))}
        />
      )}{" "}
      {tab === "coupons" && (
        <CouponManager
          coupons={coupons.map((c) => ({
            ...c,
            expiresAt: c.expiresAt.toISOString(),
          }))}
        />
      )}{" "}
      {tab === "orders" && (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>ORDER</th>
                <th>CUSTOMER / SHIPPING</th>
                <th>ITEMS</th>
                <th>TOTAL</th>
                <th>PAYMENT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const address = o.shipping as {
                  name: string;
                  line1: string;
                  city: string;
                  postalCode: string;
                  phone: string;
                };
                return (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/orders/${o.id}`}>{o.id} ↗</Link>
                      <span className="small-note">
                        {o.createdAt.toLocaleDateString("en-GB")}
                      </span>
                    </td>
                    <td>
                      {o.email}
                      <span className="small-note">
                        {address.name}
                        <br />
                        {address.line1}, {address.city} {address.postalCode}
                        <br />
                        {address.phone}
                      </span>
                    </td>
                    <td>
                      {o.items.map((i) => (
                        <div key={i.id}>
                          {i.name} · {i.size} · {i.color} × {i.quantity}
                        </div>
                      ))}
                    </td>
                    <td>{money(o.total)}</td>
                    <td>
                      {o.paymentMethod}
                      <span className="small-note">{o.paymentStatus}</span>
                    </td>
                    <td>
                      <OrderStatus id={o.id} status={o.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!orders.length && (
            <div className="empty-state">
              <p>Your first order will appear here.</p>
            </div>
          )}
        </div>
      )}
      {tab === "customers" && (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>JOINED</th>
                <th>ORDERS</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.createdAt.toLocaleDateString("en-GB")}</td>
                  <td>{c._count.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
