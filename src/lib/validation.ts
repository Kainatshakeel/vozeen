import { z } from "zod";
export const addressSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .regex(/^(\+92|0)3\d{9}$/, "Enter a Pakistani mobile number"),
  line1: z.string().trim().min(8).max(250),
  city: z.string().trim().min(2).max(80),
  postalCode: z.string().regex(/^\d{5}$/, "Enter a five-digit postal code"),
});
export const checkoutSchema = z.object({
  email: z.email(),
  shipping: addressSchema,
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(30),
  coupon: z.string().max(40).optional(),
  paymentMethod: z.enum(["COD", "JAZZCASH", "EASYPAISA", "CARD"]),
  idempotencyKey: z.uuid(),
});
export function totals(subtotal: number, percent = 0) {
  const discount = Math.floor((subtotal * percent) / 100);
  const shippingFee = subtotal >= 1500000 ? 0 : 25000;
  return {
    subtotal,
    discount,
    shippingFee,
    total: subtotal - discount + shippingFee,
  };
}
