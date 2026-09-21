"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function submitReview(orderId: string, formData: FormData) {
  const supabase = await createClient();
  const rating = Number(formData.get("rating"));
  const body = String(formData.get("body") ?? "").trim();

  if (!rating || rating < 1 || rating > 5) {
    return { error: "Choose a rating from 1 to 5." };
  }

  const { error } = await supabase.from("reviews").insert({ order_id: orderId, rating, body });
  if (error) return { error: error.message };

  revalidatePath(`/orders/${orderId}`);
  return { error: null };
}
