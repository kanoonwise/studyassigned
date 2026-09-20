"use client";

import { useState } from "react";
import { calculateQuote, formatInr, unitLabel, type PriceUnit } from "@/lib/tools/quote";
import { logToolEvent } from "@/lib/tools-log-client";
import { EmailResultOptIn } from "@/components/tools/EmailResultOptIn";

interface ServiceOption {
  service: string;
  unit: PriceUnit;
  price_low: number | null;
  price_high: number | null;
}

export function QuoteForm({ services }: { services: ServiceOption[] }) {
  const [serviceName, setServiceName] = useState(services[0]?.service ?? "");
  const [quantity, setQuantity] = useState("1");
  const [turnaround, setTurnaround] = useState("14");
  const [result, setResult] = useState<{ low: number | null; high: number | null } | null>(null);
  const selected = services.find((s) => s.service === serviceName);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;
    const qty = Math.max(1, Number(quantity));
    const days = Math.max(1, Number(turnaround));

    const computed = calculateQuote({
      priceLow: selected.price_low,
      priceHigh: selected.price_high,
      quantity: qty,
      turnaroundDays: days,
    });
    setResult(computed);
    logToolEvent("quote", { service: serviceName, quantity: qty, turnaroundDays: days });
  }

  return (
    <div className="mt-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Service
          <select
            value={serviceName}
            onChange={(event) => setServiceName(event.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          >
            {services.map((service) => (
              <option key={service.service} value={service.service}>
                {service.service}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Quantity ({selected ? unitLabel(selected.unit).replace("per ", "") : "unit"})
          <input
            type="number"
            min={1}
            required
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Turnaround (days)
          <input
            type="number"
            min={1}
            required
            value={turnaround}
            onChange={(event) => setTurnaround(event.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Get indicative price
        </button>
      </form>

      {result ? (
        <div className="mt-8 flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">
            {result.low != null && result.high != null
              ? `${formatInr(result.low)} – ${formatInr(result.high)}`
              : "Contact us for a quote"}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Final quote after sample review. Rush turnaround may increase the price.
          </p>
          <div className="pt-2">
            <EmailResultOptIn
              tool="quote"
              inputs={{
                service: serviceName,
                quantity: Number(quantity),
                turnaroundDays: Number(turnaround),
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
