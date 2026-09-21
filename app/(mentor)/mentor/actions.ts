"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ErrorType } from "@/lib/mentor";

export async function addAvailability(formData: FormData) {
  const startsAt = String(formData.get("startsAt") ?? "");
  const endsAt = String(formData.get("endsAt") ?? "");
  if (!startsAt || !endsAt) return { error: "Choose a start and end time." };
  if (new Date(endsAt) <= new Date(startsAt))
    return { error: "End time must be after start time." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase.from("mentor_availability").insert({
    mentor_id: user.id,
    starts_at: new Date(startsAt).toISOString(),
    ends_at: new Date(endsAt).toISOString(),
  });
  if (error) return { error: error.message };

  revalidatePath("/mentor");
  return { error: null };
}

export async function deleteAvailability(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("mentor_availability").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/mentor");
  return { error: null };
}

export async function markBookingCompleted(bookingId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("mentor_bookings")
    .update({ status: "completed" })
    .eq("id", bookingId);
  if (error) return { error: error.message };

  revalidatePath("/mentor");
  return { error: null };
}

export async function addFeedback(bookingId: string, errorType: ErrorType, detail: string) {
  if (!detail.trim()) return { error: "Add a detail for this feedback point." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("mentor_feedback")
    .insert({ booking_id: bookingId, error_type: errorType, detail: detail.trim() });
  if (error) return { error: error.message };

  revalidatePath("/mentor");
  return { error: null };
}
