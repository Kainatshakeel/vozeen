import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  apiError,
  HttpError,
  requireDatabase,
  sameOrigin,
} from "@/lib/security";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    requireDatabase();
    const { code, items } = z
      .object({
        code: z.string().max(40),
        items: z
          .array(
            z.object({
              variantId: z.string(),
              quantity: z.number().int().min(1).max(10),
            }),
          )
          .min(1)
          .max(30),
      })
      .parse(await request.json());
    const variants = await db.variant.findMany({
      where: {
        id: { in: items.map((i) => i.variantId) },
        product: { active: true },
      },
      include: { product: true },
    });
    let subtotal = 0;
    for (const item of items) {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant) throw new HttpError(400, "A product is unavailable.");
      subtotal += variant.product.price * item.quantity;
    }
    const coupon = await db.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });
    if (
      !coupon ||
      !coupon.active ||
      coupon.expiresAt < new Date() ||
      coupon.uses >= coupon.maxUses ||
      subtotal < coupon.minimum
    )
      throw new HttpError(400, "This code is not eligible for your bag.");
    return NextResponse.json({ percent: coupon.percent });
  } catch (e) {
    return apiError(e);
  }
}
