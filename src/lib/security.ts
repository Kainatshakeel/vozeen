import { db } from "./db";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function requireDatabase() {
  if (!process.env.DATABASE_URL)
    throw new HttpError(
      503,
      "The store is in catalog preview. Connect PostgreSQL to enable accounts and checkout.",
    );
}
// Persist rate limits so separate application instances share the same counters.
export async function rateLimit(key: string, limit = 10) {
  const bucket = Math.floor(Date.now() / 900000);
  const row = await db.rateLimit.upsert({
    where: { key: `${key}:${bucket}` },
    create: {
      key: `${key}:${bucket}`,
      count: 1,
      resetAt: new Date((bucket + 1) * 900000),
    },
    update: { count: { increment: 1 } },
  });
  if (row.count > limit)
    throw new HttpError(
      429,
      "Too many attempts. Please try again in 15 minutes.",
    );
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = new URL(process.env.NEXTAUTH_URL || "http://localhost:3000")
    .origin;
  if (!origin || origin !== allowed)
    throw new HttpError(403, "Request origin is not allowed.");
}
export function apiError(error: unknown) {
  if (error instanceof HttpError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  if (error instanceof ZodError)
    return NextResponse.json(
      { error: error.issues[0]?.message || "Invalid input" },
      { status: 400 },
    );
  console.error(
    "API request failed:",
    error instanceof Error ? error.message : "Unknown error",
  );
  return NextResponse.json(
    { error: "We could not complete this request. Please try again." },
    { status: 500 },
  );
}
