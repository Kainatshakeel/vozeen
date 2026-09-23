import { z } from "zod";
const image = z.url().refine((value) => {
  const url = new URL(value);
  return url.protocol === "https:" && url.hostname === "images.unsplash.com";
}, "Use an HTTPS images.unsplash.com URL, or extend the image allowlist.");
export const productSchema = z
  .object({
    name: z.string().trim().min(2).max(150),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    description: z.string().trim().min(10).max(3000),
    category: z.enum(["Women", "Men", "Formals"]),
    price: z.number().int().min(100).max(100000000),
    compareAt: z.number().int().positive().nullable().optional(),
    images: z.array(image).min(1).max(8),
    featured: z.boolean(),
    active: z.boolean(),
    fabric: z.string().trim().max(60).nullable().optional(),
    pieceType: z.string().trim().max(40).nullable().optional(),
    work: z.enum(["Embroidered", "Printed", "Solid"]).nullable().optional(),
    fit: z.string().trim().max(100).nullable().optional(),
    sizeChart: z
      .enum(["women-suit", "women-shirt", "men-suit", "men-kurta"])
      .nullable()
      .optional(),
    pieces: z
      .array(
        z.object({
          name: z.string().trim().min(1).max(40),
          fabric: z.string().trim().min(1).max(60),
          colour: z.string().trim().min(1).max(40),
        }),
      )
      .max(6)
      .default([]),
    variants: z
      .array(
        z.object({
          size: z.enum(["XS", "S", "M", "L", "XL", "XXL"]),
          color: z.string().trim().min(1).max(30),
          stock: z.number().int().min(0).max(100000),
        }),
      )
      .min(1)
      .max(100),
  })
  .refine(
    (p) =>
      new Set(p.variants.map((v) => `${v.size}:${v.color}`)).size ===
      p.variants.length,
    "Size/color combinations must be unique.",
  );
export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[A-Z0-9_-]+$/),
  percent: z.number().int().min(1).max(75),
  minimum: z.number().int().min(0),
  maxUses: z.number().int().min(1),
  expiresAt: z.iso.datetime(),
  active: z.boolean(),
});
export const transitions: Record<string, string[]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
