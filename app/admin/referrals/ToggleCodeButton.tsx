"use client";

import { useState } from "react";
import { toggleReferralCode } from "./actions";

export function ToggleCodeButton({ code, active }: { code: string; active: boolean }) {
  const [busy, setBusy] = useState(false);
  const [isActive, setIsActive] = useState(active);

  async function handleClick() {
    setBusy(true);
    const result = await toggleReferralCode(code, !isActive);
    setBusy(false);
    if (!result.error) setIsActive(!isActive);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="rounded-full border border-zinc-300 px-3 py-1 text-xs dark:border-zinc-700"
    >
      {isActive ? "Active" : "Inactive"}
    </button>
  );
}
