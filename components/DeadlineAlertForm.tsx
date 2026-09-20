"use client";

import { useState, type FormEvent } from "react";

export function DeadlineAlertForm({ institutionCode }: { institutionCode: string }) {
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    const response = await fetch("/api/forms/deadline-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ institutionCode, contact, consent }),
    });
    setStatus(response.ok ? "sent" : "error");
  }

  if (status === "sent") {
    return (
      <p className="text-sm text-green-700 dark:text-green-400">
        We&apos;ll email you once this is verified.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 text-sm">
      <label className="flex flex-col gap-1">
        Notify me when this is verified
        <input
          type="email"
          required
          value={contact}
          onChange={(event) => setContact(event.target.value)}
          placeholder="you@example.com"
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
        />
      </label>
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-1"
        />
        <span>I consent to being contacted when this deadline is verified.</span>
      </label>
      <button
        type="submit"
        disabled={status === "sending" || !consent}
        className="self-start rounded-full border border-zinc-300 px-4 py-2 disabled:opacity-50 dark:border-zinc-700"
      >
        {status === "sending" ? "Saving…" : "Notify me"}
      </button>
      {status === "error" ? <p className="text-red-600">Something went wrong.</p> : null}
    </form>
  );
}
