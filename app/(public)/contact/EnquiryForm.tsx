"use client";

import { useState, type FormEvent } from "react";
import { TurnstileWidget } from "@/components/TurnstileWidget";

type Status = "idle" | "submitting" | "sent" | "flagged" | "error";

export function EnquiryForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("submitting");

    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      institutionName: form.get("institutionName"),
      service: form.get("service"),
      message: form.get("message"),
      consent: form.get("consent") === "on",
      turnstileToken,
    };

    const response = await fetch("/api/forms/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong. Please try again.");
      setStatus("error");
      return;
    }

    const body = await response.json();
    setStatus(body.flagged ? "flagged" : "sent");
    event.currentTarget.reset();
  }

  if (status === "sent") {
    return (
      <p className="mt-8 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
        Thanks - we&apos;ve received your enquiry and will follow up shortly.
      </p>
    );
  }

  if (status === "flagged") {
    return (
      <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        Thanks for reaching out. From your message, it sounds like you may be looking for something
        we don&apos;t provide - see our Integrity Policy for what we do and don&apos;t do. A member
        of our team will still follow up to see how we can genuinely help.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input
          name="name"
          required
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            name="email"
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Phone
          <input
            name="phone"
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        Institution (optional)
        <input
          name="institutionName"
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Service you&apos;re interested in
        <input
          name="service"
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Message
        <textarea
          name="message"
          required
          rows={5}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
        />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span>I consent to StudyAssigned storing my details to respond to this enquiry.</span>
      </label>

      <TurnstileWidget onVerify={setTurnstileToken} />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {status === "submitting" ? "Sending…" : "Send enquiry"}
      </button>

      <p className="text-xs text-zinc-500">
        Informational only. Your institution&apos;s own rules and official notices apply.
      </p>
    </form>
  );
}
