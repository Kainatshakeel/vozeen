import { randomBytes, randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "./db";
import { checkoutSchema, totals } from "./validation";
import { HttpError } from "./security";
export async function createOrder(
  input: z.infer<typeof checkoutSchema>,
  userId?: string,
) {
  // Serializable transactions plus conditional stock updates prevent concurrent overselling.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await db.$transaction(
        async (tx) => {
          const existing = await tx.order.findUnique({
            where: { idempotencyKey: input.idempotencyKey },
            include: { items: true },
          });
          if (existing) {
            if (
              existing.email !== input.email ||
              existing.userId !== (userId || null)
            )
              throw new HttpError(409, "Checkout key already used.");
            const requested = new Map<string, number>();
            for (const item of input.items)
              requested.set(
                item.variantId,
                (requested.get(item.variantId) || 0) + item.quantity,
              );
            const shipping = existing.shipping as Record<string, string>;
            if (
              existing.paymentMethod !== input.paymentMethod ||
              (existing.couponCode || "") !==
                (input.coupon || "").trim().toUpperCase() ||
              existing.items.length !== requested.size ||
              existing.items.some(
                (item) => requested.get(item.variantId) !== item.quantity,
              ) ||
              Object.entries(input.shipping).some(
                ([key, value]) => shipping[key] !== value,
              )
            ) {
              throw new HttpError(
                409,
                "An order was already reserved with different details. Contact support to reconcile it before placing another order.",
              );
            }
            return existing;
          }
          const quantities = new Map<string, number>();
          for (const item of input.items)
            quantities.set(
              item.variantId,
              (quantities.get(item.variantId) || 0) + item.quantity,
            );
          const variants = await tx.variant.findMany({
            where: {
              id: { in: [...quantities.keys()] },
              product: { active: true },
            },
            include: { product: true },
          });
          if (variants.length !== quantities.size)
            throw new HttpError(
              400,
              "One of these pieces is no longer available.",
            );
          let subtotal = 0;
          for (const v of variants) {
            const qty = quantities.get(v.id)!;
            if (qty > 10)
              throw new HttpError(
                400,
                "A maximum of 10 of each size is allowed.",
              );
            const result = await tx.variant.updateMany({
              where: { id: v.id, stock: { gte: qty } },
              data: { stock: { decrement: qty } },
            });
            if (result.count !== 1)
              throw new HttpError(
                409,
                `${v.product.name} (${v.size}) has insufficient stock.`,
              );
            subtotal += v.product.price * qty;
          }
          let percent = 0;
          let couponCode: string | undefined;
          if (input.coupon) {
            const code = input.coupon.trim().toUpperCase();
            const coupon = await tx.coupon.findUnique({ where: { code } });
            if (
              !coupon ||
              !coupon.active ||
              coupon.expiresAt < new Date() ||
              coupon.uses >= coupon.maxUses ||
              subtotal < coupon.minimum
            )
              throw new HttpError(
                400,
                "This promo code is unavailable or its minimum has not been met.",
              );
            const updated = await tx.coupon.updateMany({
              where: { code, uses: coupon.uses },
              data: { uses: { increment: 1 } },
            });
            if (!updated.count)
              throw new HttpError(409, "Promo code changed. Please try again.");
            percent = coupon.percent;
            couponCode = code;
          }
          return tx.order.create({
            data: {
              id: `T${Date.now()}${randomBytes(4).toString("hex")}`,
              userId,
              email: input.email,
              shipping: input.shipping,
              ...totals(subtotal, percent),
              paymentMethod: input.paymentMethod,
              trackingToken: randomUUID(),
              idempotencyKey: input.idempotencyKey,
              couponCode,
              items: {
                create: variants.map((v) => ({
                  variantId: v.id,
                  name: v.product.name,
                  image: v.product.images[0],
                  size: v.size,
                  color: v.color,
                  price: v.product.price,
                  quantity: quantities.get(v.id)!,
                })),
              },
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P2034" || error.code === "P2002") &&
        attempt < 2
      )
        continue;
      throw error;
    }
  }
  throw new HttpError(409, "Checkout is busy. Please try again.");
}
export async function confirmPayment(
  orderId: string,
  amount: number,
  method: string,
  reference: string,
) {
  return db.$transaction(
    async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order || order.total !== amount || order.paymentMethod !== method)
        throw new HttpError(400, "Payment details do not match the order.");
      if (order.paymentStatus === "PAID") return order;
      if (order.status === "CANCELLED")
        throw new HttpError(
          409,
          "Cancelled order needs manual payment reconciliation.",
        );
      return tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          paymentReference: reference,
          status: "PROCESSING",
        },
      });
    },
    { isolationLevel: "Serializable" },
  );
}
export async function cancelOrder(id: string) {
  return db.$transaction(
    async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!order) throw new HttpError(404, "Order not found.");
      if (order.status === "CANCELLED") return order;
      if (
        order.paymentStatus === "PAID" ||
        !["PENDING", "PROCESSING"].includes(order.status)
      )
        throw new HttpError(
          409,
          "Only unpaid, unshipped orders can be cancelled here.",
        );
      await tx.order.update({ where: { id }, data: { status: "CANCELLED" } });
      for (const i of order.items)
        await tx.variant.update({
          where: { id: i.variantId },
          data: { stock: { increment: i.quantity } },
        });
      if (order.couponCode)
        await tx.coupon.updateMany({
          where: { code: order.couponCode, uses: { gt: 0 } },
          data: { uses: { decrement: 1 } },
        });
      return order;
    },
    { isolationLevel: "Serializable" },
  );
}
