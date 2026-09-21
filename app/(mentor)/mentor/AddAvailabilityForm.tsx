"use client";

import { useRef, useState } from "react";
import { addAvailability } from "./actions";

export function AddAvailabilityForm() {
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function action(formData: FormData) {
    setError(null);
    const result = await addAvailability(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={action} className="flex flex-wrap items-end gap-2 text-sm">
      <label className="flex flex-col gap-1">
        Starts
        <input
          type="datetime-local"
          name="startsAt"
          required
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
        />
      </label>
      <label className="flex flex-col gap-1">
        Ends
        <input
          type="datetime-local"
          name="endsAt"
          required
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
        />
      </label>
      <button type="submit" className="bg-primary text-primary-foreground rounded-full px-4 py-2">
        Add slot
      </button>
      {error ? <p className="w-full text-red-600">{error}</p> : null}
    </form>
  );
}
