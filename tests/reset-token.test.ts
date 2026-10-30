import test from "node:test";
import assert from "node:assert/strict";
process.env.NEXTAUTH_SECRET = "test-secret-test-secret-test-secret";
import { createResetToken, parseResetToken, resetTokenValid } from "../src/lib/reset-token";
const user = { id: "u1", passwordHash: "hash-a" };
test("a fresh token is valid for the same password hash", () => {
  const parsed = parseResetToken(createResetToken(user))!;
  assert.equal(resetTokenValid(parsed, "hash-a"), true);
});
test("token stops working once the password changes", () => {
  const parsed = parseResetToken(createResetToken(user))!;
  assert.equal(resetTokenValid(parsed, "hash-b"), false);
});
test("tampered or expired tokens are rejected", () => {
  const parsed = parseResetToken(createResetToken(user))!;
  assert.equal(resetTokenValid({ ...parsed, userId: "u2" }, "hash-a"), false);
  assert.equal(resetTokenValid({ ...parsed, expires: Date.now() - 1 }, "hash-a"), false);
  assert.equal(parseResetToken("garbage"), null);
});
