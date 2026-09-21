"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function bookSlot(availabilityId: string, orderId: string | null) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("book_mentor_slot", {
    p_availability_id: availabilityId,
    p_order_id: orderId,
  });
  if (error) return { error: error.message };

  revalidatePath("/account/mentoring");
  return { error: null };
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("mentor_bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);
  if (error) return { error: error.message };

  revalidatePath("/account/mentoring");
  return { error: null };
}
