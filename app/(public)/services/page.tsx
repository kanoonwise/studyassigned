import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { servicesIntro, serviceDescriptions } from "@/content/services";
import { formatPriceRange } from "@/lib/tools/quote";

export const metadata: Metadata = {
  title: "Services & Pricing",
  description: servicesIntro.subtitle,
};

export default async function ServicesPage() {
  const supabase = await createClient();
  const { data: prices } = await supabase
    .from("public_service_prices")
    .select("service, unit, price_low, price_high, note")
    .order("service");

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">{servicesIntro.title}</h1>
      <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">{servicesIntro.subtitle}</p>

      <div className="mt-10 divide-y divide-zinc-200 dark:divide-zinc-800">
        {prices && prices.length > 0 ? (
          prices.map((row) => (
            <div key={row.service} className="flex flex-col gap-1 py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-medium">{row.service}</h2>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {formatPriceRange(row.price_low, row.price_high, row.unit)}
                </span>
              </div>
              {serviceDescriptions[row.service] ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {serviceDescriptions[row.service]}
                </p>
              ) : null}
              {row.note ? <p className="text-xs text-zinc-500">{row.note}</p> : null}
            </div>
          ))
        ) : (
          <p className="py-5 text-sm text-zinc-500">
            Pricing is being updated. Please get in touch for a quote.
          </p>
        )}
      </div>

      <p className="mt-8 text-sm text-zinc-500">
        Every price is a starting range - the final quote is confirmed after we review a sample of
        your work. Informational only. Your institution&apos;s own rules and official notices apply.
      </p>
    </div>
  );
}
