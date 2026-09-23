"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function Logout() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/" })}>Sign out</button>
  );
}
export function AddressForm() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <form
      className="form-stack panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const form = e.currentTarget;
        try {
          const res = await fetch("/api/account/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(new FormData(form))),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          form.reset();
          setMessage("Address saved.");
          router.refresh();
        } catch (error) {
          setMessage(
            error instanceof Error ? error.message : "Unable to save.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>A familiar destination.</h2>
      <div className="form-grid">
        <label>
          Name
          <input name="name" required minLength={2} />
        </label>
        <label>
          Phone
          <input name="phone" placeholder="03001234567" required />
        </label>
        <label className="full">
          Street address
          <input name="line1" required minLength={8} />
        </label>
        <label>
          City
          <input name="city" required />
        </label>
        <label>
          Postal code
          <input name="postalCode" pattern="[0-9]{5}" required />
        </label>
      </div>
      <button className="button" disabled={busy}>
        {busy ? "Saving…" : "Save address"}
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
export function DeleteAddress({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  return (
    <>
      <button
        className="remove-button"
        onClick={async () => {
          try {
            const res = await fetch("/api/account/addresses", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id }),
            });
            if (!res.ok) throw new Error("Unable to remove address.");
            router.refresh();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Try again.");
          }
        }}
      >
        Remove
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
