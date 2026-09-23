import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { checkoutSchema, totals, addressSchema } from "../src/lib/validation";
import { verifySignature, jazzHash } from "../src/lib/payments/signatures";
import { productSchema, transitions } from "../src/lib/admin";
test("shipping threshold uses integer paisa and percentage discounts round down", () => {
  assert.deepEqual(totals(100001, 15), {
    subtotal: 100001,
    discount: 15000,
    shippingFee: 25000,
    total: 110001,
  });
  assert.equal(totals(1500000).shippingFee, 0);
  assert.equal(totals(1499999).shippingFee, 25000);
});
test("checkout rejects negative quantities, unknown payment methods and injected totals", () => {
  const base = {
    email: "customer@example.com",
    shipping: {
      name: "Ayesha Ali",
      phone: "03001234567",
      line1: "12 Example Street",
      city: "Lahore",
      postalCode: "54000",
    },
    items: [{ variantId: "variant-1", quantity: 1 }],
    paymentMethod: "COD",
    idempotencyKey: "957af577-dace-44d2-9dfc-2b2eec0e5366",
    total: 1,
  };
  const parsed = checkoutSchema.parse(base);
  assert.equal("total" in parsed, false);
  assert.equal(
    checkoutSchema.safeParse({
      ...base,
      items: [{ variantId: "x", quantity: -1 }],
    }).success,
    false,
  );
  assert.equal(
    checkoutSchema.safeParse({ ...base, paymentMethod: "FREE" }).success,
    false,
  );
});
test("Pakistan address validation rejects malformed phone numbers and postal codes", () => {
  assert.equal(
    addressSchema.safeParse({
      name: "Ali",
      phone: "123",
      line1: "Main Road 12",
      city: "Karachi",
      postalCode: "abc",
    }).success,
    false,
  );
});
test("signed callbacks reject modified bodies, missing secrets and replayed timestamps", () => {
  const now = Date.now();
  const time = String(Math.floor(now / 1000));
  const raw = '{"amount":10000}';
  const secret = "test-secret";
  const sig = createHmac("sha256", secret)
    .update(`${time}.${raw}`)
    .digest("hex");
  assert.equal(verifySignature(raw, time, sig, secret, now), true);
  assert.equal(verifySignature('{"amount":1}', time, sig, secret, now), false);
  assert.equal(verifySignature(raw, time, sig, "", now), false);
  assert.equal(verifySignature(raw, time, sig, secret, now + 301000), false);
});
test("JazzCash signing is independent of insertion order and excludes secure hash", () => {
  const a = { pp_Amount: "10000", pp_TxnRefNo: "T123", pp_Empty: "" };
  const b = {
    pp_SecureHash: "ignored",
    pp_TxnRefNo: "T123",
    pp_Amount: "10000",
  };
  assert.equal(jazzHash(a, "salt"), jazzHash(b, "salt"));
  assert.notEqual(
    jazzHash(a, "salt"),
    jazzHash({ ...a, pp_Amount: "1" }, "salt"),
  );
});
test("product validation rejects duplicate variants and untrusted image hosts", () => {
  const base = {
    name: "Linen Shirt",
    slug: "linen-shirt",
    description: "A considered linen shirt.",
    category: "Women",
    price: 450000,
    images: ["https://images.unsplash.com/photo-example"],
    featured: false,
    active: true,
    variants: [{ size: "S", color: "Ivory", stock: 2 }],
  };
  assert.equal(productSchema.safeParse(base).success, true);
  assert.equal(
    productSchema.safeParse({
      ...base,
      variants: [...base.variants, ...base.variants],
    }).success,
    false,
  );
  assert.equal(
    productSchema.safeParse({
      ...base,
      images: ["https://evil.example/test.png"],
    }).success,
    false,
  );
});
test("fulfilled orders cannot regress through admin status transitions", () => {
  assert.deepEqual(transitions.DELIVERED, []);
  assert.deepEqual(transitions.CANCELLED, []);
  assert.equal(transitions.PENDING.includes("DELIVERED"), false);
});
