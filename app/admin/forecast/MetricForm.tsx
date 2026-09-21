"use client";

import { useRef, useState } from "react";
import { upsertActual, upsertForecast } from "./actions";

export function MetricForm({ kind }: { kind: "actual" | "forecast" }) {
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submit = kind === "actual" ? upsertActual : upsertForecast;

  async function action(formData: FormData) {
    setError(null);
    const result = await submit(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-2 text-sm">
      <h2 className="font-medium">Record {kind === "actual" ? "an actual" : "a forecast"}</h2>
      <input
        type="month"
        name="month"
        required
        className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
      />
      <input
        name="metric"
        placeholder="Metric, e.g. leads"
        required
        className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
      />
      <input
        type="number"
        step="any"
        name="value"
        placeholder="Value"
        required
        className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
      />
      <button
        type="submit"
        className="self-start rounded-full bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Save {kind}
      </button>
      {error ? <p className="text-red-600">{error}</p> : null}
    </form>
  );
}
