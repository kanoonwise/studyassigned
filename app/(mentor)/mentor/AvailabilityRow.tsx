"use client";

import { useState } from "react";
import { deleteAvailability } from "./actions";

interface Slot {
  id: string;
  starts_at: string;
  ends_at: string;
  is_booked: boolean;
}

export function AvailabilityRow({ slot }: { slot: Slot }) {
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    await deleteAvailability(slot.id);
  }

  return (
    <li className="flex items-center justify-between gap-2 rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-800">
      <span>
        {new Date(slot.starts_at).toLocaleString()} &ndash;{" "}
        {new Date(slot.ends_at).toLocaleTimeString()}
        {slot.is_booked ? <span className="ml-2 text-zinc-500">(booked)</span> : null}
      </span>
      {!slot.is_booked ? (
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className="rounded-full border border-red-300 px-3 py-1 text-xs text-red-700 dark:border-red-900 dark:text-red-400"
        >
          Remove
        </button>
      ) : null}
    </li>
  );
}
