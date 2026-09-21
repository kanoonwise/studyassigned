"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function firstOfMonth(value: string): string {
  return `${value.slice(0, 7)}-01`;
}

export async function upsertActual(formData: FormData) {
  const month = firstOfMonth(String(formData.get("month") ?? ""));
  const metric = String(formData.get("metric") ?? "").trim();
  const value = Number(formData.get("value"));
  if (!month || !metric || Number.isNaN(value))
    return { error: "Fill in month, metric and value." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("admin_actuals")
    .upsert({ month, metric, value }, { onConflict: "month,metric" });
  if (error) return { error: error.message };

  revalidatePath("/admin/forecast");
  return { error: null };
}

export async function upsertForecast(formData: FormData) {
  const month = firstOfMonth(String(formData.get("month") ?? ""));
  const metric = String(formData.get("metric") ?? "").trim();
  const value = Number(formData.get("value"));
  if (!month || !metric || Number.isNaN(value))
    return { error: "Fill in month, metric and value." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("admin_forecasts")
    .upsert({ month, metric, value }, { onConflict: "month,metric" });
  if (error) return { error: error.message };

  revalidatePath("/admin/forecast");
  return { error: null };
}

export async function addChecklistItem(formData: FormData) {
  const month = firstOfMonth(String(formData.get("month") ?? ""));
  const item = String(formData.get("item") ?? "").trim();
  if (!month || !item) return { error: "Fill in month and item." };

  const supabase = await createClient();
  const { error } = await supabase.from("campaign_checklist_items").insert({ month, item });
  if (error) return { error: error.message };

  revalidatePath("/admin/forecast");
  return { error: null };
}

export async function toggleChecklistItem(id: string, done: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("campaign_checklist_items").update({ done }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/forecast");
  return { error: null };
}
