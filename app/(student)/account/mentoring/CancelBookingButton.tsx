"use client";

import { useState } from "react";
import { cancelBooking } from "./actions";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (!confirm("Cancel this session?")) return;
    setBusy(true);
    await cancelBooking(bookingId);
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="rounded-full border border-red-300 px-3 py-1 text-xs text-red-700 dark:border-red-900 dark:text-red-400"
    >
      Cancel
    </button>
  );
}
