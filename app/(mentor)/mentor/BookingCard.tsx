"use client";

import { useState } from "react";
import { ERROR_TYPE_LABELS, type ErrorType } from "@/lib/mentor";
import { addFeedback, markBookingCompleted } from "./actions";

interface Booking {
  id: string;
  student_id: string;
  status: "scheduled" | "completed" | "cancelled";
  created_at: string;
}

type Slot = { starts_at: string; ends_at: string } | undefined;

const ERROR_TYPES = Object.keys(ERROR_TYPE_LABELS) as ErrorType[];

export function BookingCard({
  booking,
  slot,
  studentName,
}: {
  booking: Booking;
  slot: Slot;
  studentName: string;
}) {
  const [errorType, setErrorType] = useState<ErrorType>("structure");
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddFeedback() {
    setBusy(true);
    setError(null);
    const result = await addFeedback(booking.id, errorType, detail);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDetail("");
  }

  async function handleComplete() {
    setBusy(true);
    await markBookingCompleted(booking.id);
    setBusy(false);
  }

  return (
    <li className="rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">
      <p className="font-medium">
        {studentName} · {booking.status}
      </p>
      {slot ? <p className="text-zinc-500">{new Date(slot.starts_at).toLocaleString()}</p> : null}

      {booking.status !== "cancelled" ? (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <select
              value={errorType}
              onChange={(e) => setErrorType(e.target.value as ErrorType)}
              className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
            >
              {ERROR_TYPES.map((type) => (
                <option key={type} value={type}>
                  {ERROR_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Feedback point"
              className="flex-1 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
            />
            <button
              type="button"
              onClick={handleAddFeedback}
              disabled={busy}
              className="rounded-full border border-zinc-300 px-3 py-1 dark:border-zinc-700"
            >
              Add
            </button>
          </div>
          {error ? <p className="text-red-600">{error}</p> : null}
          {booking.status === "scheduled" ? (
            <button
              type="button"
              onClick={handleComplete}
              disabled={busy}
              className="bg-primary text-primary-foreground self-start rounded-full px-3 py-1 text-xs"
            >
              Mark completed
            </button>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
