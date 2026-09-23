import { after, NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation";
import {
  apiError,
  HttpError,
  rateLimit,
  requireDatabase,
  sameOrigin,
} from "@/lib/security";
import { currentUser } from "@/lib/auth";
import { createOrder } from "@/lib/orders";
import { enabledPayments, initiatePayment } from "@/lib/payments";
import { sendOrderConfirmation } from "@/lib/email";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    requireDatabase();
    const input = checkoutSchema.parse(await request.json());
    await rateLimit(`checkout:${input.email.toLowerCase()}`, 10);
    if (!enabledPayments()[input.paymentMethod])
      throw new HttpError(503, "This payment method is not available yet.");
    const user = await currentUser();
    const order = await createOrder(input, user?.id);
    if (order.status === "CANCELLED")
      throw new HttpError(
        409,
        "This checkout was cancelled. Please start a new order.",
      );
    after(() => sendOrderConfirmation(order.id));
    if (order.paymentStatus === "PAID")
      return NextResponse.json({
        orderId: order.id,
        url: `/orders/${order.id}?token=${order.trackingToken}`,
      });
    const payment = await initiatePayment(order);
    return NextResponse.json(
      { orderId: order.id, ...payment },
      { status: 201 },
    );
  } catch (e) {
    return apiError(e);
  }
}
