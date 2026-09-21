"use client";

import { useState, useTransition } from "react";
import { toggleHandled } from "./actions";
import type { Database } from "@/lib/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

export function LeadRow({ lead }: { lead: Lead }) {
  const [handled, setHandled] = useState(lead.handled_at != null);
  const [, startTransition] = useTransition();

  function toggle() {
    const next = !handled;
    setHandled(next);
    startTransition(() => {
      toggleHandled(lead.id, next);
    });
  }

  return (
    <tr
      className={`border-b border-zinc-100 dark:border-zinc-900 ${lead.flagged ? "bg-amber-50 dark:bg-amber-950/30" : ""}`}
    >
      <td className="py-2 pr-4">{new Date(lead.created_at).toLocaleDateString()}</td>
      <td className="py-2 pr-4">{lead.name ?? "-"}</td>
      <td className="py-2 pr-4">{lead.email ?? lead.phone ?? "-"}</td>
      <td className="py-2 pr-4">{lead.service ?? "-"}</td>
      <td className="py-2 pr-4">
        {lead.flagged ? (
          <span className="text-amber-700 dark:text-amber-400">{lead.flag_reason}</span>
        ) : (
          "-"
        )}
      </td>
      <td className="py-2 pr-4">
        <button
          type="button"
          onClick={toggle}
          className="rounded-full border border-zinc-300 px-3 py-1 text-xs dark:border-zinc-700"
        >
          {handled ? "Handled" : "Mark handled"}
        </button>
      </td>
    </tr>
  );
}
