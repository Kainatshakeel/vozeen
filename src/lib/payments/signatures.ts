import { createHmac, timingSafeEqual } from "node:crypto";
export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export function verifySignature(
  body: string,
  timestamp: string,
  signature: string,
  secret: string,
  now = Date.now(),
) {
  if (
    !secret ||
    !timestamp ||
    !Number.isFinite(Number(timestamp)) ||
    Math.abs(now / 1000 - Number(timestamp)) > 300
  )
    return false;
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");
  return safeEqual(expected, signature);
}
export function jazzHash(fields: Record<string, string>, salt: string) {
  const values = Object.keys(fields)
    .filter(
      (k) => k.startsWith("pp") && k !== "pp_SecureHash" && fields[k] !== "",
    )
    .sort()
    .map((k) => fields[k]);
  return createHmac("sha256", salt)
    .update([salt, ...values].join("&"))
    .digest("hex")
    .toUpperCase();
}
