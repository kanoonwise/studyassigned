"use client";

import { useState, type FormEvent } from "react";

export function DeadlineAlertForm({
  institutionCode,
  verified,
}: {
  institutionCode: string;
  verified: boolean;
}) {
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
        {verified
          ? "We'll email you a reminder as this deadline approaches. Unsubscribe any time from that email."
          : "We'll email you once this is verified."}
      </p>
    );
  }

  const label = verified ? "Remind me before this deadline" : "Notify me when this is verified";
  const consentLabel = verified
    ? "I consent to being emailed a reminder before this deadline."
    : "I consent to being contacted when this deadline is verified.";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 text-sm">
      <label className="flex flex-col gap-1">
        {label}
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
        <span>{consentLabel}</span>
      </label>
      <button
        type="submit"
        disabled={status === "sending" || !consent}
        className="self-start rounded-full border border-zinc-300 px-4 py-2 disabled:opacity-50 dark:border-zinc-700"
      >
        {status === "sending" ? "Saving…" : verified ? "Remind me" : "Notify me"}
      </button>
      {status === "error" ? <p className="text-red-600">Something went wrong.</p> : null}
    </form>
  );
}
