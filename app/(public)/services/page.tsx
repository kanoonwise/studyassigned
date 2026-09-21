import type { Metadata } from "next";
import { FileSearch, Quote, PenLine, Users, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { servicesIntro, serviceDescriptions } from "@/content/services";
import { formatPriceRange } from "@/lib/tools/quote";

export const metadata: Metadata = {
  title: "Services & Pricing",
  description: servicesIntro.subtitle,
};

const SERVICE_ICONS: Record<string, typeof FileSearch> = {
  "Similarity/AI report explanation": FileSearch,
  "Citation and reference formatting": Quote,
  "Author-led revision editing": PenLine,
  "Mentoring session (60 min)": Users,
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

      <div className="mt-10 flex flex-col gap-4">
        {prices && prices.length > 0 ? (
          prices.map((row) => {
            const Icon = SERVICE_ICONS[row.service] ?? Wrench;
            return (
              <div
                key={row.service}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:gap-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="bg-primary-soft text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-medium">{row.service}</h2>
                    <span className="bg-accent-soft text-accent-foreground rounded-full px-3 py-1 text-sm font-medium">
                      {formatPriceRange(row.price_low, row.price_high, row.unit)}
                    </span>
                  </div>
                  {serviceDescriptions[row.service] ? (
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {serviceDescriptions[row.service]}
                    </p>
                  ) : null}
                  {row.note ? <p className="mt-1 text-xs text-zinc-500">{row.note}</p> : null}
                </div>
              </div>
            );
          })
        ) : (
          <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700">
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
