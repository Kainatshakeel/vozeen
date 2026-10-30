"use client";
import Link from "next/link";
import { useState } from "react";
export function ForgotForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="form-stack"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        setMessage("");
        const email = new FormData(e.currentTarget).get("email");
        try {
          const res = await fetch("/api/auth/forgot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const body = await res.json();
          if (!res.ok) throw new Error(body.error);
          setMessage(
            "If an account uses this email, we have sent a link to reset your password. It is valid for 1 hour.",
          );
        } catch (err) {
          setError(err instanceof Error ? err.message : "Please try again.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <label>
        Email address <span className="req">*</span>
        <input name="email" type="email" autoComplete="email" required />
      </label>
      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}
      {message && <p role="status">{message}</p>}
      <button className="button" disabled={busy}>
        {busy ? "Sending…" : "Send reset link"} →
      </button>
      <p>
        <Link href="/login" style={{ textDecoration: "underline" }}>
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
export function ResetForm({ token }: { token: string }) {
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  if (done)
    return (
      <div className="form-stack">
        <p role="status">Your password has been changed.</p>
        <Link className="button" href="/login">
          Sign in →
        </Link>
      </div>
    );
  return (
    <form
      className="form-stack"
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        if (data.get("password") !== data.get("confirm")) {
          setError("The passwords do not match.");
          return;
        }
        setBusy(true);
        setError("");
        try {
          const res = await fetch("/api/auth/reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password: data.get("password") }),
          });
          const body = await res.json();
          if (!res.ok) throw new Error(body.error);
          setDone(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Please try again.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <label>
        New password <span className="req">*</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          required
        />
      </label>
      <label>
        Confirm new password <span className="req">*</span>
        <input
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          required
        />
      </label>
      <span className="small-note">Use at least 12 characters.</span>
      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}
      <button className="button" disabled={busy}>
        {busy ? "Saving…" : "Change password"} →
      </button>
    </form>
  );
}
