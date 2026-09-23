import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { money, parsePieces } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import {
  AddressForm,
  DeleteAddress,
  Logout,
} from "@/components/account-actions";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};
export default async function Account({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = process.env.DATABASE_URL ? await currentUser() : null;
  if (!user) redirect("/login");
  const { tab = "orders" } = await searchParams;
  const [orders, addresses, wishlist] = await Promise.all([
    db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.address.findMany({ where: { userId: user.id } }),
    db.wishlist.findMany({
      where: { userId: user.id, product: { active: true } },
      include: { product: { include: { variants: true } } },
    }),
  ]);
  return (
    <div className="container" style={{ paddingBottom: 70 }}>
      <div className="page-heading">
        <p className="eyebrow muted">YOUR LITTLE CORNER OF VOZEEN</p>
        <h1>Hello, {user.name.split(" ")[0]}.</h1>
        <p>Your orders, addresses and wishlist.</p>
      </div>
      <nav className="account-tabs">
        {["orders", "addresses", "wishlist"].map((t) => (
          <Link
            key={t}
            href={`/account?tab=${t}`}
            className={tab === t ? "active" : ""}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Link>
        ))}
        {user.role === "ADMIN" && <Link href="/admin">Studio dashboard ↗</Link>}
        <Logout />
      </nav>
      {tab === "orders" &&
        (orders.length ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ORDER</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th>TOTAL</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.createdAt.toLocaleDateString("en-GB")}</td>
                    <td>
                      <span className="status">{o.status}</span>
                    </td>
                    <td>{money(o.total)}</td>
                    <td>
                      <Link href={`/orders/${o.id}`}>View order ↗</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h2>Your story starts with a piece.</h2>
            <p>No orders yet. Find something you will love.</p>
            <Link className="button" href="/shop">
              Explore the collection
            </Link>
          </div>
        ))}
      {tab === "addresses" && (
        <div className="checkout-layout">
          <AddressForm />
          <div>
            {addresses.map((a) => (
              <div className="panel" key={a.id} style={{ marginBottom: 15 }}>
                <h3>{a.name}</h3>
                <p>
                  {a.line1}
                  <br />
                  {a.city}, {a.postalCode}
                  <br />
                  {a.phone}
                </p>
                <DeleteAddress id={a.id} />
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "wishlist" &&
        (wishlist.length ? (
          <div className="product-grid">
            {wishlist.map((w) => (
              <ProductCard
                key={w.productId}
                product={{
                  ...w.product,
                  pieces: parsePieces(w.product.pieces),
                }}
                initialSaved
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>A space for your favorites.</h2>
            <p>Tap the heart on a product to save it here.</p>
            <Link className="button" href="/shop">
              Find your favorites
            </Link>
          </div>
        ))}
    </div>
  );
}
