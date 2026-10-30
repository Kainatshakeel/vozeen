import { createHmac, timingSafeEqual } from "node:crypto";
// Stateless, single-use reset links: the signature covers the current password
// hash, so a link stops working as soon as the password changes or it expires.
const TTL_MS = 60 * 60 * 1000;
function sign(userId: string, expires: number, passwordHash: string) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set");
  return createHmac("sha256", secret)
    .update(`${userId}.${expires}.${passwordHash}`)
    .digest("base64url");
}
export function createResetToken(user: { id: string; passwordHash: string }) {
  const expires = Date.now() + TTL_MS;
  return `${user.id}.${expires}.${sign(user.id, expires, user.passwordHash)}`;
}
export function parseResetToken(token: string) {
  const [userId, expires, signature] = token.split(".");
  if (!userId || !expires || !signature || !Number.isFinite(Number(expires)))
    return null;
  return { userId, expires: Number(expires), signature };
}
export function resetTokenValid(
  parsed: { userId: string; expires: number; signature: string },
  passwordHash: string,
) {
  if (Date.now() > parsed.expires) return false;
  const expected = Buffer.from(
    sign(parsed.userId, parsed.expires, passwordHash),
  );
  const given = Buffer.from(parsed.signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
