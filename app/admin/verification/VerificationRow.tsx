"use client";

import { useState } from "react";
import { assignOwner, markVerified } from "./actions";

interface Authority {
  aishe_code: string;
  name: string;
  state: string | null;
  active_covered: number | null;
  calendar_url: string | null;
  exam_url: string | null;
  status: string;
  owner: string | null;
  last_checked: string | null;
}

export function VerificationRow({ authority }: { authority: Authority }) {
  const [open, setOpen] = useState(false);
  const [owner, setOwner] = useState(authority.owner ?? "");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(authority.status === "verified");

  async function handleVerify(formData: FormData) {
    setError(null);
    const result = await markVerified(authority.aishe_code, formData);
    if (result.error) {
      setError(result.error);
    } else {
      setDone(true);
      setOpen(false);
    }
  }

  async function handleOwnerBlur() {
    await assignOwner(authority.aishe_code, owner);
  }

  return (
    <div className="py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium">{authority.name}</p>
          <p className="text-xs text-zinc-500">
            {authority.aishe_code} · {authority.state ?? "-"} · covers{" "}
            {authority.active_covered ?? 0} institutions · {done ? "verified" : authority.status}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {authority.calendar_url ? (
            <a
              href={authority.calendar_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline-offset-4 hover:underline"
            >
              Open calendar
            </a>
          ) : null}
          <input
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            onBlur={handleOwnerBlur}
            placeholder="Owner"
            className="w-32 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700"
          />
          {!done ? (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="rounded-full border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
            >
              {open ? "Cancel" : "Mark verified"}
            </button>
          ) : null}
        </div>
      </div>

      {open ? (
        <form
          action={handleVerify}
          className="mt-3 flex flex-col gap-2 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800"
        >
          <label className="flex flex-col gap-1">
            Event type
            <input
              name="eventType"
              required
              className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
            />
          </label>
          <label className="flex flex-col gap-1">
            Exact date
            <input
              type="date"
              name="exactDate"
              required
              className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
            />
          </label>
          <label className="flex flex-col gap-1">
            Evidence URL
            <input
              type="url"
              name="evidenceUrl"
              required
              className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
            />
          </label>
          <button
            type="submit"
            className="mt-1 self-start rounded-full bg-zinc-900 px-4 py-1.5 text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Confirm verified
          </button>
          {error ? <p className="text-red-600">{error}</p> : null}
        </form>
      ) : null}
    </div>
  );
}
