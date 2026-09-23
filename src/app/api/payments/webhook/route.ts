import { NextResponse } from "next/server";
import { z } from "zod";
import { verifySignature } from "@/lib/payments/signatures";
import { confirmPayment } from "@/lib/orders";
import { apiError, HttpError } from "@/lib/security";
export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (
      !verifySignature(
        raw,
        request.headers.get("x-payment-timestamp") || "",
        request.headers.get("x-payment-signature") || "",
        process.env.PAYMENT_WEBHOOK_SECRET || "",
      )
    )
      throw new HttpError(401, "Invalid signature.");
    const event = z
      .object({
        orderId: z.string(),
        amount: z.number().int().positive(),
        currency: z.literal("PKR"),
        method: z.enum(["JAZZCASH", "EASYPAISA", "CARD"]),
        reference: z.string().min(1),
        status: z.enum(["succeeded", "failed", "pending"]),
      })
      .parse(JSON.parse(raw));
    if (event.status === "succeeded")
      await confirmPayment(
        event.orderId,
        event.amount,
        event.method,
        event.reference,
      );
    return NextResponse.json({ received: true });
  } catch (e) {
    return apiError(e);
  }
}
