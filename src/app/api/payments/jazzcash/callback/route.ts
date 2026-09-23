import { NextResponse } from "next/server";
import { jazzHash, safeEqual } from "@/lib/payments/signatures";
import { confirmPayment } from "@/lib/orders";
import { db } from "@/lib/db";
import { apiError, HttpError } from "@/lib/security";
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const fields = Object.fromEntries(
      [...form.entries()].map(([k, v]) => [k, String(v)]),
    );
    const salt = process.env.JAZZCASH_INTEGRITY_SALT;
    if (
      !salt ||
      !safeEqual(
        jazzHash(fields, salt),
        (fields.pp_SecureHash || "").toUpperCase(),
      ) ||
      fields.pp_MerchantID !== process.env.JAZZCASH_MERCHANT_ID
    )
      throw new HttpError(401, "Invalid JazzCash signature.");
    const order = await db.order.findUnique({
      where: { id: fields.pp_TxnRefNo },
    });
    if (!order) throw new HttpError(404, "Order not found.");
    if (fields.pp_ResponseCode === "000") {
      if (fields.pp_TxnCurrency !== "PKR" || !fields.pp_RetreivalReferenceNo)
        throw new HttpError(400, "Incomplete payment response.");
      await confirmPayment(
        order.id,
        Number(fields.pp_Amount),
        "JAZZCASH",
        fields.pp_RetreivalReferenceNo,
      );
    }
    return NextResponse.redirect(
      new URL(
        `/orders/${order.id}?token=${order.trackingToken}`,
        process.env.NEXTAUTH_URL || "http://localhost:3000",
      ),
      303,
    );
  } catch (e) {
    return apiError(e);
  }
}
