"use client";

import { useState } from "react";
import { updatePrice } from "./actions";
import type { Database } from "@/lib/supabase/types";

type ServicePrice = Database["public"]["Tables"]["service_prices"]["Row"];

export function PriceRow({ price }: { price: ServicePrice }) {
  const [saved, setSaved] = useState(false);

  async function action(formData: FormData) {
    const result = await updatePrice(price.id, formData);
    setSaved(!result.error);
  }

  return (
    <form
      action={action}
      className="grid grid-cols-2 gap-2 border-b border-zinc-100 py-3 text-sm sm:grid-cols-6 sm:items-center dark:border-zinc-900"
    >
      <span className="col-span-2 font-medium sm:col-span-1">{price.service}</span>
      <span className="text-zinc-500">{price.unit}</span>
      <input
        type="number"
        step="0.01"
        name="price_low"
        defaultValue={price.price_low ?? ""}
        className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
      />
      <input
        type="number"
        step="0.01"
        name="price_high"
        defaultValue={price.price_high ?? ""}
        className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
      />
      <input
        name="note"
        defaultValue={price.note ?? ""}
        placeholder="Note"
        className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
      />
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1">
          <input type="checkbox" name="active" defaultChecked={price.active} /> Active
        </label>
        <button
          type="submit"
          className="rounded-full border border-zinc-300 px-3 py-1 dark:border-zinc-700"
        >
          Save
        </button>
        {saved ? <span className="text-green-700 dark:text-green-400">✓</span> : null}
      </div>
    </form>
  );
}
