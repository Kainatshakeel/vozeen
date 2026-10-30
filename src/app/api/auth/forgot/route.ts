import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendPasswordReset } from "@/lib/email";
import { createResetToken } from "@/lib/reset-token";
import {
  apiError,
  rateLimit,
  requireDatabase,
  sameOrigin,
} from "@/lib/security";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    requireDatabase();
    const { email } = z
      .object({ email: z.email().transform((v) => v.toLowerCase()) })
      .parse(await request.json());
    await rateLimit(`forgot:${email}`, 3);
    const user = await db.user.findUnique({ where: { email } });
    if (user) {
      const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const link = `${base}/reset-password?token=${encodeURIComponent(createResetToken(user))}`;
      await sendPasswordReset(user.email, link);
    }
    // Same answer whether or not the account exists.
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
