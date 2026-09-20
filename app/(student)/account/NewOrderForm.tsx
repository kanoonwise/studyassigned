"use client";

import { useState } from "react";
import { createOrder } from "./actions";

export function NewOrderForm() {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function action(formData: FormData) {
    setError(null);
    const result = await createOrder(formData);
    if (result.error) setError(result.error);
    else setDone(true);
  }

  if (done) {
    return <p className="text-sm text-green-700 dark:text-green-400">Request submitted.</p>;
  }

  return (
    <form action={action} className="flex flex-col gap-2 text-sm sm:flex-row sm:items-end">
      <label className="flex flex-1 flex-col gap-1">
        What do you need help with?
        <input
          name="service"
          required
          placeholder="e.g. Author-led revision editing"
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
        />
      </label>
      <button
        type="submit"
        className="rounded-full bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Request
      </button>
      {error ? <p className="text-red-600">{error}</p> : null}
    </form>
  );
}
