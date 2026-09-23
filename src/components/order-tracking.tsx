"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./cart-provider";
export function OrderTracking({
  idempotencyKey,
  poll,
}: {
  idempotencyKey: string;
  poll: boolean;
}) {
  const { clear } = useCart();
  const router = useRouter();
  useEffect(() => {
    if (sessionStorage.getItem("vozeen-checkout-key") === idempotencyKey) {
      clear();
      sessionStorage.removeItem("vozeen-checkout-key");
      sessionStorage.removeItem("vozeen-coupon");
    }
  }, [idempotencyKey, clear]);
  useEffect(() => {
    if (!poll) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 15000);
    return () => clearInterval(timer);
  }, [poll, router]);
  return null;
}
