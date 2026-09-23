import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { productSchema, couponSchema, transitions } from "@/lib/admin";
import { cancelOrder } from "@/lib/orders";
import { apiError, sameOrigin, HttpError } from "@/lib/security";
type Context = { params: Promise<{ resource: string }> };
export async function POST(request: Request, { params }: Context) {
  try {
    sameOrigin(request);
    await requireAdmin();
    const { resource } = await params;
    const body = await request.json();
    if (resource === "products") {
      const { variants, ...data } = productSchema.parse(body);
      const product = await db.product.create({
        data: { ...data, variants: { create: variants } },
      });
      return NextResponse.json({ id: product.id }, { status: 201 });
    }
    if (resource === "coupons") {
      const data = couponSchema.parse(body);
      await db.coupon.create({
        data: { ...data, expiresAt: new Date(data.expiresAt) },
      });
      return NextResponse.json({ ok: true }, { status: 201 });
    }
    throw new HttpError(404, "Not found.");
  } catch (e) {
    return apiError(e);
  }
}
export async function PATCH(request: Request, { params }: Context) {
  try {
    sameOrigin(request);
    await requireAdmin();
    const { resource } = await params;
    const body = await request.json();
    if (resource === "products") {
      const id = z.string().parse(body.id);
      const { variants, ...data } = productSchema.parse(body);
      await db.$transaction(
        async (tx) => {
          await tx.product.update({ where: { id }, data });
          const prior = await tx.variant.findMany({ where: { productId: id } });
          for (const old of prior) {
            if (
              !variants.some(
                (v) => v.size === old.size && v.color === old.color,
              )
            )
              await tx.variant.update({
                where: { id: old.id },
                data: { stock: 0 },
              });
          }
          for (const v of variants)
            await tx.variant.upsert({
              where: {
                productId_size_color: {
                  productId: id,
                  size: v.size,
                  color: v.color,
                },
              },
              create: { ...v, productId: id },
              update: { stock: v.stock },
            });
        },
        { isolationLevel: "Serializable" },
      );
      return NextResponse.json({ ok: true });
    }
    if (resource === "orders") {
      const { id, status } = z
        .object({
          id: z.string(),
          status: z.enum(["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
        })
        .parse(body);
      if (status === "CANCELLED") {
        await cancelOrder(id);
      } else {
        await db.$transaction(
          async (tx) => {
            const order = await tx.order.findUnique({ where: { id } });
            if (!order || !transitions[order.status]?.includes(status))
              throw new HttpError(
                409,
                "This status transition is not allowed.",
              );
            if (order.paymentMethod !== "COD" && order.paymentStatus !== "PAID")
              throw new HttpError(
                409,
                "Online payment must be confirmed before fulfilment.",
              );
            await tx.order.update({
              where: { id },
              data: {
                status,
                ...(status === "DELIVERED" && order.paymentMethod === "COD"
                  ? { paymentStatus: "PAID" }
                  : {}),
              },
            });
          },
          { isolationLevel: "Serializable" },
        );
      }
      return NextResponse.json({ ok: true });
    }
    if (resource === "coupons") {
      const data = couponSchema.parse(body);
      await db.coupon.update({
        where: { code: data.code },
        data: { ...data, expiresAt: new Date(data.expiresAt) },
      });
      return NextResponse.json({ ok: true });
    }
    throw new HttpError(404, "Not found.");
  } catch (e) {
    return apiError(e);
  }
}
export async function DELETE(request: Request, { params }: Context) {
  try {
    sameOrigin(request);
    await requireAdmin();
    const { resource } = await params;
    const { id } = z.object({ id: z.string() }).parse(await request.json());
    if (resource === "products")
      await db.product.update({ where: { id }, data: { active: false } });
    else if (resource === "coupons")
      await db.coupon.update({ where: { code: id }, data: { active: false } });
    else throw new HttpError(404, "Not found.");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
