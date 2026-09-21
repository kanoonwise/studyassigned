"use client";

import { useState } from "react";
import { bookSlot } from "./actions";

export function BookSlotButton({ availabilityId }: { availabilityId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setBusy(true);
    setError(null);
    const result = await bookSlot(availabilityId, null);
    setBusy(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="bg-primary text-primary-foreground rounded-full px-4 py-1.5 disabled:opacity-50"
      >
        {busy ? "Booking…" : "Book"}
      </button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
