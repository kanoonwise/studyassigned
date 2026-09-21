"use client";

import { useEffect, useState } from "react";
import { getStoredConsent, loadAnalyticsIfConsented, storeConsent } from "@/lib/analytics";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // localStorage isn't available during SSR, so whether to show the banner
    // can only be known after mount - the sanctioned case for setState here.
    if (getStoredConsent() === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    } else {
      loadAnalyticsIfConsented();
    }
  }, []);

  function choose(choice: "accepted" | "declined") {
    storeConsent(choice);
    setVisible(false);
    if (choice === "accepted") loadAnalyticsIfConsented();
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-sm sm:flex-row sm:justify-between">
        <p className="text-zinc-600 dark:text-zinc-400">
          We use cookies only for anonymous usage analytics. Nothing is shared with advertisers.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => choose("declined")}
            className="rounded-full border border-zinc-300 px-4 py-1.5 dark:border-zinc-700"
          >
            Decline
          </button>
          <button
            onClick={() => choose("accepted")}
            className="rounded-full bg-zinc-900 px-4 py-1.5 text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
