import nodemailer, { type Transporter } from "nodemailer";
import { db } from "./db";
import { money } from "./catalog";

const methods: Record<string, string> = {
  COD: "Cash on delivery",
  JAZZCASH: "JazzCash",
  EASYPAISA: "EasyPaisa",
  CARD: "Debit / credit card",
};

export function emailEnabled() {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
  );
}

let transport: Transporter | undefined;
function mailer() {
  const port = Number(process.env.SMTP_PORT || 465);
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transport;
}

const escape = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

// Claims the order before sending so checkout retries never send a second copy.
export async function sendOrderConfirmation(orderId: string) {
  if (!emailEnabled()) return;
  const claimed = await db.order.updateMany({
    where: { id: orderId, confirmationSentAt: null },
    data: { confirmationSentAt: new Date() },
  });
  if (!claimed.count) return;
  const order = await db.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: true },
  });
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://vozeen.com";
  const link = `${site}/orders/${order.id}?token=${order.trackingToken}`;
  const ship = order.shipping as Record<string, string>;
  const payment =
    order.paymentMethod === "COD"
      ? `Cash on delivery: please keep ${money(order.total)} ready.`
      : order.paymentStatus === "PAID"
        ? "Your payment is confirmed."
        : `Payment by ${methods[order.paymentMethod] || order.paymentMethod} is awaiting confirmation. If you did not finish paying, your order stays reserved until we contact you.`;
  const rows = [
    ...order.items.map((i) => [
      `${i.name} × ${i.quantity} (${i.size} / ${i.color})`,
      money(i.price * i.quantity),
    ]),
    ["Subtotal", money(order.subtotal)],
    ...(order.discount
      ? [
          [
            `Discount${order.couponCode ? ` (${order.couponCode})` : ""}`,
            `− ${money(order.discount)}`,
          ],
        ]
      : []),
    ["Shipping", order.shippingFee ? money(order.shippingFee) : "Free"],
  ];
  const address = [
    ship.name,
    ship.line1,
    `${ship.city} ${ship.postalCode}`,
    ship.phone,
  ];

  const text = [
    `Thank you for your order, ${ship.name}.`,
    "",
    `Order ID: ${order.id}`,
    `Tracking key: ${order.trackingToken}`,
    `Track your order: ${link}`,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    `Total: ${money(order.total)}`,
    "",
    `Payment: ${methods[order.paymentMethod] || order.paymentMethod}`,
    payment,
    "",
    "Delivering to:",
    ...address,
    "",
    "Keep your tracking key private. Reply to this email if anything looks wrong.",
    "Vozeen",
  ].join("\n");

  const cell = "padding:8px 0;border-bottom:1px solid #e6e1d8";
  const html = `<!doctype html><html><body style="margin:0;background:#f6f3ee;font-family:Arial,Helvetica,sans-serif;color:#22231f">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<p style="font-size:22px;font-weight:bold;letter-spacing:-.5px;margin:0 0 24px">vozeen</p>
<h1 style="font-size:24px;font-weight:normal;margin:0 0 8px">Thank you, ${escape(ship.name)}.</h1>
<p style="margin:0 0 24px;color:#5c5d57">We have received your order and will let you know as it moves along.</p>
<div style="background:#fff;padding:20px;margin-bottom:20px">
<p style="margin:0 0 6px"><strong>Order ID:</strong> ${escape(order.id)}</p>
<p style="margin:0 0 16px;word-break:break-all"><strong>Tracking key:</strong> ${escape(order.trackingToken)}</p>
<a href="${escape(link)}" style="display:inline-block;background:#22231f;color:#fff;text-decoration:none;padding:12px 20px">Track your order</a>
</div>
<table style="width:100%;border-collapse:collapse;background:#fff;padding:20px;font-size:14px" cellpadding="0">
${rows.map(([label, value]) => `<tr><td style="${cell};padding-left:20px">${escape(label)}</td><td style="${cell};padding-right:20px;text-align:right">${escape(value)}</td></tr>`).join("")}
<tr><td style="padding:12px 20px;font-weight:bold">Total</td><td style="padding:12px 20px;text-align:right;font-weight:bold">${escape(money(order.total))}</td></tr>
</table>
<div style="background:#fff;padding:20px;margin-top:20px;font-size:14px">
<p style="margin:0 0 6px"><strong>Payment:</strong> ${escape(methods[order.paymentMethod] || order.paymentMethod)}</p>
<p style="margin:0 0 16px;color:#5c5d57">${escape(payment)}</p>
<p style="margin:0 0 6px"><strong>Delivering to</strong></p>
<p style="margin:0;color:#5c5d57">${address.map(escape).join("<br>")}</p>
</div>
<p style="font-size:12px;color:#8a8b84;margin-top:24px">Keep your tracking key private. Reply to this email if anything looks wrong.</p>
</div></body></html>`;

  try {
    await mailer().sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      replyTo: process.env.EMAIL_REPLY_TO || undefined,
      to: order.email,
      subject: `Your Vozeen order ${order.id}`,
      text,
      html,
    });
  } catch (error) {
    // Release the claim so a later retry can send it; never log SMTP credentials.
    await db.order.update({
      where: { id: orderId },
      data: { confirmationSentAt: null },
    });
    console.error(
      "Order confirmation email failed:",
      order.id,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}
