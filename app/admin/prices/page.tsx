import { createClient } from "@/lib/supabase/server";
import { PriceRow } from "./PriceRow";

export default async function AdminPricesPage() {
  const supabase = await createClient();
  const { data: prices } = await supabase.from("service_prices").select("*").order("service");

  return (
    <div>
      <h1 className="text-xl font-semibold">Prices</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Changes take effect immediately on the public Services page and Instant Quote Calculator.
      </p>
      <div className="mt-6">
        {prices?.map((price) => (
          <PriceRow key={price.id} price={price} />
        ))}
        {!prices || prices.length === 0 ? (
          <p className="py-4 text-sm text-zinc-500">No services configured yet.</p>
        ) : null}
      </div>
    </div>
  );
}
