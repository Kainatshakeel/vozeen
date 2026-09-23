"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export function AuthForm({ signup = false }: { signup?: boolean }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (signup) {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
      }
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error)
        throw new Error(
          "Unable to sign in. Check your details and database configuration.",
        );
      router.push("/account");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="form-stack" onSubmit={submit}>
      {signup && (
        <label>
          Your name
          <input name="name" autoComplete="name" required minLength={2} />
        </label>
      )}
      <label>
        Email address
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete={signup ? "new-password" : "current-password"}
          minLength={signup ? 12 : 1}
          maxLength={128}
          required
        />
      </label>
      {signup && (
        <span className="small-note">
          Use at least 12 characters for your password.
        </span>
      )}
      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}
      <button className="button" disabled={busy}>
        {busy ? "Just a moment…" : signup ? "Create your account" : "Sign in"} →
      </button>
      <p>
        {signup ? "Already part of Vozeen?" : "New here?"}{" "}
        <Link
          href={signup ? "/login" : "/signup"}
          style={{ textDecoration: "underline" }}
        >
          {signup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
