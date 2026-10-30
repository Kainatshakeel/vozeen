import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { SLOTS } from "@/lib/home-images";
import { apiError, HttpError, sameOrigin } from "@/lib/security";
import { UPLOAD_PATH } from "@/lib/uploads";
const slotSchema = z
  .string()
  .refine((s) => SLOTS.some((slot) => slot.key === s), "Unknown photo slot.");
// Set a slot to an uploaded photo (the file itself comes from /api/admin/uploads).
export async function PUT(request: Request) {
  try {
    sameOrigin(request);
    await requireAdmin();
    const { slot, url } = z
      .object({
        slot: slotSchema,
        url: z.string().regex(UPLOAD_PATH, "Use an uploaded photo."),
      })
      .parse(await request.json());
    const known = await db.upload.findUnique({
      where: { id: url.split("/").pop() },
      select: { id: true },
    });
    if (!known) throw new HttpError(400, "That photo was not found.");
    await db.$executeRaw`INSERT INTO "SiteImage" ("slot", "url", "updatedAt") VALUES (${slot}, ${url}, NOW()) ON CONFLICT ("slot") DO UPDATE SET "url" = EXCLUDED."url", "updatedAt" = NOW()`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
// Go back to the default photo for a slot.
export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    await requireAdmin();
    const { slot } = z.object({ slot: slotSchema }).parse(await request.json());
    await db.$executeRaw`DELETE FROM "SiteImage" WHERE "slot" = ${slot}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
