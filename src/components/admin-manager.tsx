"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatMoney } from "./product-card";
import { transitions } from "@/lib/admin";
type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  compareAt: number | null;
  images: string[];
  active: boolean;
  featured: boolean;
  fabric: string | null;
  pieceType: string | null;
  work: string | null;
  fit: string | null;
  sizeChart: string | null;
  pieces: { name: string; fabric: string; colour: string }[];
  variants: { size: string; color: string; stock: number }[];
};
async function mutate(resource: string, method: string, body: unknown) {
  const response = await fetch(`/api/admin/${resource}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}
export function ProductManager({ products }: { products: AdminProduct[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminProduct | null | undefined>();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const form = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const variants = String(form.variants)
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [size, color, stock] = line.split(",").map((s) => s.trim());
          return { size, color, stock: Number(stock) };
        });
      await mutate("products", editing ? "PATCH" : "POST", {
        id: editing?.id,
        name: form.name,
        slug: form.slug,
        description: form.description,
        category: form.category,
        price: Math.round(Number(form.price) * 100),
        compareAt: form.compareAt
          ? Math.round(Number(form.compareAt) * 100)
          : null,
        images: String(form.images)
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        featured: form.featured === "on",
        active: form.active === "on",
        fabric: String(form.fabric || "").trim() || null,
        pieceType: String(form.pieceType || "") || null,
        work: String(form.work || "") || null,
        fit: String(form.fit || "").trim() || null,
        sizeChart: String(form.sizeChart || "") || null,
        pieces: String(form.pieces || "")
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => {
            const [name, fabric, colour] = line.split(",").map((s) => s.trim());
            return { name, fabric, colour };
          }),
        variants,
      });
      setEditing(undefined);
      setMessage("Product saved.");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="section-heading">
        <h2>The collection</h2>
        <button className="button" onClick={() => setEditing(null)}>
          Add product <Plus size={15} />
        </button>
      </div>
      {message && (
        <div className="alert" role="status">
          {message}
        </div>
      )}
      {editing !== undefined && (
        <form
          className="admin-product-form panel"
          onSubmit={submit}
          key={editing?.id || "new"}
        >
          <label>
            Product name
            <input name="name" defaultValue={editing?.name} required />
          </label>
          <label>
            URL slug
            <input
              name="slug"
              defaultValue={editing?.slug}
              placeholder="crimson-chikankari-suit"
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
            />
          </label>
          <label>
            Category
            <select name="category" defaultValue={editing?.category || "Women"}>
              <option>Women</option>
              <option>Men</option>
              <option>Formals</option>
            </select>
          </label>
          <label>
            Price (PKR)
            <input
              name="price"
              type="number"
              min="1"
              step="0.01"
              defaultValue={editing ? editing.price / 100 : ""}
              required
            />
          </label>
          <label>
            Compare-at price (PKR)
            <input
              name="compareAt"
              type="number"
              min="1"
              step="0.01"
              defaultValue={editing?.compareAt ? editing.compareAt / 100 : ""}
            />
          </label>
          <label>
            Main fabric
            <input
              name="fabric"
              defaultValue={editing?.fabric || ""}
              placeholder="Lawn"
            />
          </label>
          <label>
            Pieces
            <select name="pieceType" defaultValue={editing?.pieceType || ""}>
              <option value="">Not set</option>
              <option>1 Piece</option>
              <option>2 Piece</option>
              <option>3 Piece</option>
            </select>
          </label>
          <label>
            Type
            <select name="work" defaultValue={editing?.work || ""}>
              <option value="">Not set</option>
              <option>Embroidered</option>
              <option>Printed</option>
              <option>Solid</option>
            </select>
          </label>
          <label>
            Size chart
            <select name="sizeChart" defaultValue={editing?.sizeChart || ""}>
              <option value="">Automatic (by category)</option>
              <option value="women-suit">Women: shirt + trouser</option>
              <option value="women-shirt">Women: shirt only</option>
              <option value="men-suit">Men: kameez + shalwar</option>
              <option value="men-kurta">Men: kurta only</option>
            </select>
          </label>
          <label className="full">
            Fit
            <input
              name="fit"
              defaultValue={editing?.fit || ""}
              placeholder="Regular Fit A-Line Shirt"
            />
          </label>
          <label className="full">
            Pieces: piece, fabric, colour (one per line)
            <textarea
              name="pieces"
              rows={3}
              defaultValue={editing?.pieces
                .map((p) => `${p.name}, ${p.fabric}, ${p.colour}`)
                .join("\n")}
              placeholder={
                "Shirt, Embroidered Lawn, Crimson\nTrouser, Cambric, Crimson\nDupatta, Chiffon, Crimson"
              }
            />
          </label>
          <div style={{ display: "flex", gap: 25, alignItems: "center" }}>
            <label>
              <input
                name="active"
                type="checkbox"
                defaultChecked={editing?.active ?? true}
                style={{ width: 15, marginRight: 8 }}
              />
              Active
            </label>
            <label>
              <input
                name="featured"
                type="checkbox"
                defaultChecked={editing?.featured}
                style={{ width: 15, marginRight: 8 }}
              />
              Featured
            </label>
          </div>
          <label className="full">
            Description
            <textarea
              name="description"
              minLength={10}
              rows={3}
              defaultValue={editing?.description}
              required
            />
          </label>
          <label>
            Image URLs (one per line)
            <textarea
              name="images"
              rows={5}
              defaultValue={editing?.images.join("\n")}
              placeholder="https://images.unsplash.com/…"
              required
            />
          </label>
          <label>
            Variants: size, color, stock (one per line)
            <textarea
              name="variants"
              rows={5}
              defaultValue={
                editing?.variants
                  .map((v) => `${v.size}, ${v.color}, ${v.stock}`)
                  .join("\n") || "S, Maroon, 10\nM, Maroon, 10\nL, Maroon, 10"
              }
              required
            />
          </label>
          <div className="full" style={{ display: "flex", gap: 12 }}>
            <button className="button" disabled={busy}>
              {busy ? "Saving…" : "Save product"}
            </button>
            <button
              className="button button-outline"
              type="button"
              onClick={() => setEditing(undefined)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>PRODUCT</th>
              <th>CATEGORY</th>
              <th>PRICE</th>
              <th>STOCK</th>
              <th>STATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{formatMoney(p.price)}</td>
                <td>{p.variants.reduce((s, v) => s + v.stock, 0)}</td>
                <td>
                  <span className="status">
                    {p.active ? "ACTIVE" : "ARCHIVED"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 20 }}>
                    <button
                      className="icon-button"
                      aria-label={`Edit ${p.name}`}
                      onClick={() => setEditing(p)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Archive ${p.name}`}
                      onClick={async () => {
                        try {
                          await mutate("products", "DELETE", { id: p.id });
                          setMessage(
                            "Product archived. Order history remains intact.",
                          );
                          router.refresh();
                        } catch (e) {
                          setMessage(
                            e instanceof Error
                              ? e.message
                              : "Unable to archive.",
                          );
                        }
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
type Coupon = {
  code: string;
  percent: number;
  minimum: number;
  maxUses: number;
  uses: number;
  expiresAt: string;
  active: boolean;
};
export function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <h2 style={{ marginBottom: 25 }}>A little something extra.</h2>
      <form
        className="admin-product-form panel"
        key={editing?.code || "new"}
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const form = e.currentTarget;
          const data = Object.fromEntries(new FormData(form));
          try {
            await mutate("coupons", editing ? "PATCH" : "POST", {
              code: String(data.code).toUpperCase(),
              percent: Number(data.percent),
              minimum: Math.round(Number(data.minimum) * 100),
              maxUses: Number(data.maxUses),
              expiresAt: new Date(String(data.expiresAt)).toISOString(),
              active: data.active === "on",
            });
            form.reset();
            setEditing(null);
            setMessage("Promo code saved.");
            router.refresh();
          } catch (e) {
            setMessage(e instanceof Error ? e.message : "Could not save.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Code
          <input
            name="code"
            defaultValue={editing?.code}
            readOnly={!!editing}
            required
            placeholder="WELCOME10"
          />
        </label>
        <label>
          Discount (%)
          <input
            name="percent"
            type="number"
            min="1"
            max="75"
            defaultValue={editing?.percent || 10}
            required
          />
        </label>
        <label>
          Minimum spend (PKR)
          <input
            name="minimum"
            type="number"
            min="0"
            defaultValue={(editing?.minimum || 0) / 100}
            required
          />
        </label>
        <label>
          Maximum uses
          <input
            name="maxUses"
            type="number"
            min="1"
            defaultValue={editing?.maxUses || 100}
            required
          />
        </label>
        <label>
          Expires at
          <input
            name="expiresAt"
            type="datetime-local"
            defaultValue={editing?.expiresAt.slice(0, 16)}
            required
          />
        </label>
        <label>
          Enabled
          <input
            name="active"
            type="checkbox"
            style={{ width: 20, display: "block" }}
            defaultChecked={editing?.active ?? true}
          />
        </label>
        <button className="button" disabled={busy}>
          {busy ? "Saving…" : editing ? "Update code" : "Create code"}
        </button>
        {editing && (
          <button
            type="button"
            className="button button-outline"
            onClick={() => setEditing(null)}
          >
            Cancel edit
          </button>
        )}
      </form>
      {message && (
        <div className="alert" role="status">
          {message}
        </div>
      )}
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>CODE</th>
              <th>DISCOUNT</th>
              <th>USES</th>
              <th>STATUS</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.code}>
                <td>{c.code}</td>
                <td>{c.percent}%</td>
                <td>
                  {c.uses} / {c.maxUses}
                </td>
                <td>{c.active ? "Active" : "Disabled"}</td>
                <td>
                  <button
                    className="button button-outline"
                    onClick={() => setEditing(c)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
export function OrderStatus({ id, status }: { id: string; status: string }) {
  const [message, setMessage] = useState("");
  const router = useRouter();
  return (
    <>
      <select
        aria-label="Update order status"
        value={status}
        onChange={async (e) => {
          try {
            await mutate("orders", "PATCH", { id, status: e.target.value });
            router.refresh();
          } catch (e) {
            setMessage(e instanceof Error ? e.message : "Could not update.");
          }
        }}
      >
        <option value={status}>{status}</option>
        {transitions[status]?.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      {message && (
        <span className="small-note" role="alert">
          {message}
        </span>
      )}
    </>
  );
}
