import type { Order } from "@prisma/client";
import { z } from "zod";
import { HttpError } from "../security";
import { jazzHash } from "./signatures";
export const paymentMethods = ["COD", "JAZZCASH", "EASYPAISA", "CARD"] as const;
export function enabledPayments() {
  const bridge = !!(
    process.env.PAYMENT_BRIDGE_URL &&
    process.env.PAYMENT_BRIDGE_KEY &&
    process.env.PAYMENT_WEBHOOK_SECRET &&
    process.env.PAYMENT_ALLOWED_HOSTS
  );
  return {
    COD: true,
    JAZZCASH:
      !!(
        process.env.JAZZCASH_MERCHANT_ID &&
        process.env.JAZZCASH_PASSWORD &&
        process.env.JAZZCASH_INTEGRITY_SALT
      ) || bridge,
    EASYPAISA: bridge,
    CARD:
      !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET) ||
      bridge,
  };
}
type PaymentResult = {
  url?: string;
  form?: { action: string; fields: Record<string, string> };
};
const site = () => process.env.NEXTAUTH_URL || "http://localhost:3000";
function jazzDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(date)
    .filter((p) => p.type !== "literal")
    .reduce<Record<string, string>>(
      (a, p) => ({ ...a, [p.type]: p.value }),
      {},
    );
}
function timestamp(date: Date) {
  const p = jazzDate(date);
  return `${p.year}${p.month}${p.day}${p.hour}${p.minute}${p.second}`;
}
export async function initiatePayment(order: Order): Promise<PaymentResult> {
  const returnUrl = `${site()}/orders/${order.id}?token=${order.trackingToken}`;
  if (order.paymentMethod === "COD") return { url: returnUrl };
  if (order.paymentMethod === "JAZZCASH" && process.env.JAZZCASH_MERCHANT_ID) {
    const fields: Record<string, string> = {
      pp_Version: "1.1",
      pp_TxnType: "MWALLET",
      pp_Language: "EN",
      pp_MerchantID: process.env.JAZZCASH_MERCHANT_ID,
      pp_Password: process.env.JAZZCASH_PASSWORD!,
      pp_TxnRefNo: order.id,
      pp_Amount: String(order.total),
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: timestamp(order.createdAt),
      pp_BillReference: order.id,
      pp_Description: "Vozeen clothing order",
      pp_TxnExpiryDateTime: timestamp(
        new Date(order.createdAt.getTime() + 3600000),
      ),
      pp_ReturnURL: `${site()}/api/payments/jazzcash/callback`,
    };
    fields.pp_SecureHash = jazzHash(
      fields,
      process.env.JAZZCASH_INTEGRITY_SALT!,
    );
    return {
      form: {
        action:
          process.env.JAZZCASH_LIVE === "true"
            ? "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/"
            : "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/",
        fields,
      },
    };
  }
  if (order.paymentMethod === "CARD" && process.env.STRIPE_SECRET_KEY) {
    const form = new URLSearchParams({
      mode: "payment",
      success_url: returnUrl,
      cancel_url: returnUrl,
      customer_email: order.email,
      client_reference_id: order.id,
      "metadata[orderId]": order.id,
      "line_items[0][price_data][currency]": "pkr",
      "line_items[0][price_data][product_data][name]": `Vozeen order ${order.id}`,
      "line_items[0][price_data][unit_amount]": String(order.total),
      "line_items[0][quantity]": "1",
    });
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": order.id,
      },
      body: form,
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok)
      throw new HttpError(
        502,
        "Card checkout is temporarily unavailable. Your order is saved; contact support before trying again.",
      );
    const result = await res.json();
    const url = z.url().parse(result.url);
    if (new URL(url).hostname !== "checkout.stripe.com")
      throw new HttpError(502, "Unexpected checkout destination.");
    return { url };
  }
  // Merchant bridge contract is explicit; it is not a fabricated EasyPaisa/PayFast API.
  const endpoint = process.env.PAYMENT_BRIDGE_URL;
  if (!endpoint || new URL(endpoint).protocol !== "https:")
    throw new HttpError(503, "This payment method is not configured.");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYMENT_BRIDGE_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": order.id,
    },
    body: JSON.stringify({
      orderId: order.id,
      amount: order.total,
      currency: "PKR",
      method: order.paymentMethod,
      email: order.email,
      returnUrl,
      webhookUrl: `${site()}/api/payments/webhook`,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new HttpError(
      502,
      "Payment checkout is unavailable. Your order is saved; contact support.",
    );
  const result = z
    .object({ checkoutUrl: z.url() })
    .parse(await response.json());
  const url = new URL(result.checkoutUrl);
  if (
    url.protocol !== "https:" ||
    !(process.env.PAYMENT_ALLOWED_HOSTS || "")
      .split(",")
      .map((s) => s.trim())
      .includes(url.hostname)
  )
    throw new HttpError(502, "Untrusted payment destination.");
  return { url: result.checkoutUrl };
}
