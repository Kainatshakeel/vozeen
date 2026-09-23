"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function TrackingForm() {
  const [message, setMessage] = useState("");
  const router = useRouter();
  return (
    <form
      className="form-stack"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const id = String(form.get("order"));
        const token = String(form.get("token"));
        if (!id || !token) {
          setMessage(
            "Enter the order ID and tracking key from your confirmation page.",
          );
          return;
        }
        router.push(
          `/orders/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`,
        );
      }}
    >
      <label>
        Order ID
        <input name="order" required placeholder="T…" />
      </label>
      <label>
        Private tracking key
        <input
          name="token"
          required
          placeholder="From your order confirmation link"
        />
      </label>
      <button className="button">Find my order →</button>
      {message && <div className="alert">{message}</div>}
      <p>
        Your tracking key is the value after “token=” in the confirmation URL.
        Signed-in customers can also view orders in their account.
      </p>
    </form>
  );
}
