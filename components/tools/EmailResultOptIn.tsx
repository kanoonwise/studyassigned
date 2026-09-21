"use client";

import { useState, type FormEvent } from "react";

export function EmailResultOptIn({
  tool,
  inputs,
}: {
  tool: string;
  inputs: Record<string, unknown>;
}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    const response = await fetch("/api/tools/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool, inputs, email, consent }),
    });
    setStatus(response.ok ? "sent" : "error");
  }

  if (status === "sent") {
    return <p className="text-sm text-green-700 dark:text-green-400">We&apos;ll be in touch.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1">
          Email me this result
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          />
        </label>
        <button
          type="submit"
          disabled={status === "sending" || !consent}
          className="rounded-full border border-zinc-300 px-4 py-2 disabled:opacity-50 dark:border-zinc-700"
        >
          {status === "sending" ? "Sending…" : "Send"}
        </button>
      </div>
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-1"
        />
        <span>I consent to StudyAssigned storing my email to send me this result.</span>
      </label>
      {status === "error" ? <p className="text-red-600">Something went wrong.</p> : null}
    </form>
  );
}
