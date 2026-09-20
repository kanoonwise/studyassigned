"use client";

import { useState, useRef } from "react";
import { updateOrder, addOrderNote, refundOrder, uploadDelivery } from "./actions";
import type { Database } from "@/lib/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];

const STATUSES = [
  "submitted",
  "screened",
  "quoted",
  "paid_part",
  "in_progress",
  "delivered",
  "closed",
  "declined",
  "refunded",
] as const;

export function OrderControls({ order }: { order: Order }) {
  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState("");
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const deliveryFormRef = useRef<HTMLFormElement>(null);

  async function handleUpdate(formData: FormData) {
    const result = await updateOrder(order.id, formData);
    setSaved(!result.error);
  }

  async function handleNote() {
    if (!note.trim()) return;
    await addOrderNote(order.id, note);
    setNote("");
  }

  async function handleRefund() {
    if (!confirm("Refund this order?")) return;
    await refundOrder(order.id);
  }

  async function handleDelivery(formData: FormData) {
    setDeliveryError(null);
    const result = await uploadDelivery(order.id, formData);
    if (result.error) setDeliveryError(result.error);
    else deliveryFormRef.current?.reset();
  }

  return (
    <div className="flex flex-col gap-8">
      <form action={handleUpdate} className="flex flex-wrap items-end gap-3 text-sm">
        <label className="flex flex-col gap-1">
          Status
          <select
            name="status"
            defaultValue={order.status ?? "submitted"}
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Quote (₹)
          <input
            type="number"
            name="quote"
            defaultValue={order.quote ?? ""}
            className="w-28 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1">
          Due date
          <input
            type="date"
            name="due_date"
            defaultValue={order.due_date ?? ""}
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-zinc-900 px-4 py-1.5 text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Save
        </button>
        {saved ? <span className="text-green-700 dark:text-green-400">Saved</span> : null}
      </form>

      <div className="flex flex-col gap-2 text-sm">
        <label className="flex flex-col gap-1">
          Add a note
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
          />
        </label>
        <button
          type="button"
          onClick={handleNote}
          className="self-start rounded-full border border-zinc-300 px-4 py-1.5 dark:border-zinc-700"
        >
          Add note
        </button>
      </div>

      <form ref={deliveryFormRef} action={handleDelivery} className="flex flex-col gap-2 text-sm">
        <label className="flex flex-col gap-1">
          Upload delivery
          <input type="file" name="file" accept=".pdf,.docx" required />
        </label>
        <button
          type="submit"
          className="self-start rounded-full border border-zinc-300 px-4 py-1.5 dark:border-zinc-700"
        >
          Upload
        </button>
        {deliveryError ? <p className="text-red-600">{deliveryError}</p> : null}
      </form>

      {order.status !== "refunded" ? (
        <button
          type="button"
          onClick={handleRefund}
          className="self-start rounded-full border border-red-300 px-4 py-1.5 text-sm text-red-700 dark:border-red-900 dark:text-red-400"
        >
          Refund order
        </button>
      ) : null}
    </div>
  );
}
