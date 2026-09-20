import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { QuoteForm } from "./QuoteForm";

export const metadata: Metadata = {
  title: "Instant Quote Calculator",
  description: "Get an indicative price range for editing, citation or report-explanation support.",
};

export default async function QuoteToolPage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("public_service_prices")
    .select("service, unit, price_low, price_high")
    .order("service");

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Instant Quote Calculator</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        An indicative range only - the final quote is confirmed after we review a sample of your
        work.
      </p>
      {services && services.length > 0 ? (
        <QuoteForm services={services} />
      ) : (
        <p className="mt-8 text-sm text-zinc-500">This tool is temporarily unavailable.</p>
      )}
    </div>
  );
}
