"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/db/audit";

export async function updatePrice(id: number, formData: FormData) {
  const supabase = await createClient();
  const { data: before } = await supabase.from("service_prices").select("*").eq("id", id).single();

  const priceLow = formData.get("price_low");
  const priceHigh = formData.get("price_high");
  const update = {
    price_low: priceLow && String(priceLow).trim() !== "" ? Number(priceLow) : null,
    price_high: priceHigh && String(priceHigh).trim() !== "" ? Number(priceHigh) : null,
    active: formData.get("active") === "on",
    note: String(formData.get("note") ?? "").trim() || null,
  };

  const { error } = await supabase.from("service_prices").update(update).eq("id", id);
  if (error) return { error: error.message };

  await writeAuditLog(supabase, {
    action: "update",
    entity: "service_prices",
    entityKey: String(id),
    before,
    after: { ...before, ...update },
  });

  revalidatePath("/admin/prices");
  return { error: null };
}
