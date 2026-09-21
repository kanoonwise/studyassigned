"use client";

import { useState } from "react";
import { submitReview } from "./actions";

export function ReviewForm({ orderId }: { orderId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function action(formData: FormData) {
    setError(null);
    const result = await submitReview(orderId, formData);
    if (result.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return <p className="text-sm text-green-700 dark:text-green-400">Thanks for the feedback.</p>;
  }

  return (
    <form action={action} className="flex flex-col gap-2 text-sm">
      <label className="flex flex-col gap-1">
        Rating (1-5)
        <input
          type="number"
          name="rating"
          min={1}
          max={5}
          required
          className="w-20 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
        />
      </label>
      <label className="flex flex-col gap-1">
        Comments
        <textarea
          name="body"
          rows={3}
          className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
        />
      </label>
      <button
        type="submit"
        className="self-start rounded-full border border-zinc-300 px-4 py-2 dark:border-zinc-700"
      >
        Submit review
      </button>
      {error ? <p className="text-red-600">{error}</p> : null}
    </form>
  );
}
