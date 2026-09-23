import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  apiError,
  sameOrigin,
  rateLimit,
  requireDatabase,
  HttpError,
} from "@/lib/security";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    requireDatabase();
    const input = z
      .object({
        name: z.string().trim().min(2).max(100),
        email: z.email().transform((v) => v.toLowerCase()),
        password: z.string().min(12, "Use at least 12 characters").max(128),
      })
      .parse(await request.json());
    await rateLimit(`signup:${input.email}`, 5);
    if (await db.user.findUnique({ where: { email: input.email } }))
      throw new HttpError(
        409,
        "An account already uses this email. Please sign in.",
      );
    await db.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: await hash(input.password, 12),
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
