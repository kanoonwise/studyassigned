"use client";

import { useRef, useState } from "react";
import { createReferralCode } from "./actions";

export function CreateCodeForm() {
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function action(formData: FormData) {
    setError(null);
    const result = await createReferralCode(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={action} className="mt-4 flex flex-wrap gap-2 text-sm">
      <input
        name="code"
        placeholder="Code, e.g. IITD-FEST"
        className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
      />
      <input
        name="ownerName"
        placeholder="Ambassador name"
        className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
      />
      <button
        type="submit"
        className="rounded bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Create code
      </button>
      {error ? <p className="w-full text-red-600">{error}</p> : null}
    </form>
  );
}
