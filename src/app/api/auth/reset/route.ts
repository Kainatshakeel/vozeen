import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { parseResetToken, resetTokenValid } from "@/lib/reset-token";
import {
  apiError,
  HttpError,
  rateLimit,
  requireDatabase,
  sameOrigin,
} from "@/lib/security";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    requireDatabase();
    const input = z
      .object({
        token: z.string().min(10).max(400),
        password: z.string().min(12, "Use at least 12 characters").max(128),
      })
      .parse(await request.json());
    const parsed = parseResetToken(input.token);
    const invalid = new HttpError(
      400,
      "This reset link is invalid or has expired. Please request a new one.",
    );
    if (!parsed) throw invalid;
    await rateLimit(`reset:${parsed.userId}`, 10);
    const user = await db.user.findUnique({ where: { id: parsed.userId } });
    if (!user || !resetTokenValid(parsed, user.passwordHash)) throw invalid;
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: await hash(input.password, 12) },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
