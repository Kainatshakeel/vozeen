import { NextResponse } from "next/server";
import { verifySignature } from "@/lib/payments/signatures";
import { confirmPayment } from "@/lib/orders";
import { apiError, HttpError } from "@/lib/security";
export async function POST(request: Request) {
  try {
    const raw = await request.text();
    const fields = (request.headers.get("stripe-signature") || "")
      .split(",")
      .map((s) => s.split("="));
    const time = fields.find(([key]) => key === "t")?.[1] || "";
    if (
      !fields.some(
        ([key, sig]) =>
          key === "v1" &&
          verifySignature(
            raw,
            time,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET || "",
          ),
      )
    )
      throw new HttpError(401, "Invalid Stripe signature.");
    const event = JSON.parse(raw);
    if (
      [
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
      ].includes(event.type)
    ) {
      const session = event.data.object;
      if (session.payment_status === "paid" && session.currency === "pkr")
        await confirmPayment(
          session.metadata.orderId,
          session.amount_total,
          "CARD",
          session.payment_intent,
        );
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    return apiError(e);
  }
}
