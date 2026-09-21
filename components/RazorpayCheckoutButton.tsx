"use client";

import { useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function RazorpayCheckoutButton({
  orderId,
  milestone,
  label,
}: {
  orderId: string;
  milestone: "deposit" | "final";
  label: string;
}) {
  const [status, setStatus] = useState<"idle" | "starting" | "error">("idle");

  async function handleClick() {
    setStatus("starting");
    const response = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, milestone }),
    });
    if (!response.ok || !window.Razorpay) {
      setStatus("error");
      return;
    }
    const { razorpayOrderId, amount, keyId } = await response.json();

    const checkout = new window.Razorpay({
      key: keyId,
      amount,
      currency: "INR",
      order_id: razorpayOrderId,
      name: "StudyAssigned",
      handler: () => window.location.reload(),
    });
    checkout.open();
    setStatus("idle");
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "starting"}
        className="rounded-full bg-zinc-900 px-6 py-2 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {status === "starting" ? "Starting…" : label}
      </button>
      {status === "error" ? <p className="text-sm text-red-600">Could not start payment.</p> : null}
    </>
  );
}
