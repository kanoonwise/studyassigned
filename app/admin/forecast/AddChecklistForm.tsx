"use client";

import { useRef, useState } from "react";
import { addChecklistItem } from "./actions";

export function AddChecklistForm() {
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function action(formData: FormData) {
    setError(null);
    const result = await addChecklistItem(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={action} className="mt-4 flex flex-wrap gap-2 text-sm">
      <input
        type="month"
        name="month"
        required
        className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
      />
      <input
        name="item"
        placeholder="Checklist item"
        required
        className="flex-1 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
      />
      <button
        type="submit"
        className="rounded-full border border-zinc-300 px-4 py-2 dark:border-zinc-700"
      >
        Add
      </button>
      {error ? <p className="w-full text-red-600">{error}</p> : null}
    </form>
  );
}
