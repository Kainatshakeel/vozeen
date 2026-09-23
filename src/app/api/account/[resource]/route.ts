import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { addressSchema } from "@/lib/validation";
import { apiError, HttpError, sameOrigin } from "@/lib/security";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  try {
    sameOrigin(request);
    const user = await requireUser();
    const { resource } = await params;
    const body = await request.json();
    if (resource === "addresses") {
      const address = addressSchema.parse(body);
      if ((await db.address.count({ where: { userId: user.id } })) >= 10)
        throw new HttpError(400, "You can save up to 10 addresses.");
      return NextResponse.json(
        await db.address.create({ data: { ...address, userId: user.id } }),
      );
    }
    if (resource === "wishlist") {
      const { productId } = z.object({ productId: z.string() }).parse(body);
      if (
        !(await db.product.findFirst({
          where: { id: productId, active: true },
        }))
      )
        throw new HttpError(404, "Product not found.");
      const where = { userId_productId: { userId: user.id, productId } };
      const saved = await db.wishlist.findUnique({ where });
      if (saved) await db.wishlist.delete({ where });
      else await db.wishlist.create({ data: { userId: user.id, productId } });
      return NextResponse.json({ saved: !saved });
    }
    throw new HttpError(404, "Not found.");
  } catch (e) {
    return apiError(e);
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  try {
    sameOrigin(request);
    const user = await requireUser();
    if ((await params).resource !== "addresses")
      throw new HttpError(404, "Not found.");
    const { id } = z.object({ id: z.string() }).parse(await request.json());
    await db.address.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
