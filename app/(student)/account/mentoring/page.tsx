import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ERROR_TYPE_LABELS } from "@/lib/mentor";
import { BookSlotButton } from "./BookSlotButton";
import { CancelBookingButton } from "./CancelBookingButton";

export const metadata: Metadata = { title: "Mentor Sessions" };

export default async function MentoringPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/mentoring");

  const [{ data: openSlots }, { data: bookings }] = await Promise.all([
    supabase
      .from("mentor_availability")
      .select("id, mentor_id, starts_at, ends_at")
      .eq("is_booked", false)
      .gt("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(50),
    supabase
      .from("mentor_bookings")
      .select("id, availability_id, mentor_id, status, created_at")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const mentorIds = [
    ...new Set([
      ...(openSlots ?? []).map((s) => s.mentor_id),
      ...(bookings ?? []).map((b) => b.mentor_id),
    ]),
  ];
  const { data: mentors } =
    mentorIds.length > 0
      ? await supabase.from("profiles").select("id, full_name, email").in("id", mentorIds)
      : { data: [] };
  const mentorName = (id: string) => {
    const mentor = mentors?.find((m) => m.id === id);
    return mentor?.full_name || mentor?.email || "Mentor";
  };

  const bookingAvailabilityIds = (bookings ?? []).map((b) => b.availability_id);
  const { data: bookedSlots } =
    bookingAvailabilityIds.length > 0
      ? await supabase
          .from("mentor_availability")
          .select("id, starts_at, ends_at")
          .in("id", bookingAvailabilityIds)
      : { data: [] };
  const slotTime = (availabilityId: string) => bookedSlots?.find((s) => s.id === availabilityId);

  const bookingIds = (bookings ?? []).map((b) => b.id);
  const { data: feedback } =
    bookingIds.length > 0
      ? await supabase
          .from("mentor_feedback")
          .select("booking_id, error_type, detail")
          .in("booking_id", bookingIds)
      : { data: [] };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/account" className="text-primary text-sm hover:underline">
          &larr; My account
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Mentor sessions</h1>
        <p className="mt-1 text-sm text-zinc-500">
          One-on-one guidance on your writing, research plan, or report questions. Informational
          only.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold">My bookings</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {bookings?.map((booking) => {
            const slot = slotTime(booking.availability_id);
            const notes = feedback?.filter((f) => f.booking_id === booking.id) ?? [];
            return (
              <li
                key={booking.id}
                className="rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800"
              >
                <p className="font-medium">
                  {mentorName(booking.mentor_id)} · {booking.status}
                </p>
                {slot ? (
                  <p className="text-zinc-500">{new Date(slot.starts_at).toLocaleString()}</p>
                ) : null}
                {notes.length > 0 ? (
                  <ul className="mt-2 flex flex-col gap-1 text-zinc-600 dark:text-zinc-400">
                    {notes.map((note, i) => (
                      <li key={i}>
                        <strong>{ERROR_TYPE_LABELS[note.error_type]}:</strong> {note.detail}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {booking.status === "scheduled" ? (
                  <div className="mt-2">
                    <CancelBookingButton bookingId={booking.id} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
        {!bookings || bookings.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No bookings yet.</p>
        ) : null}
      </div>

      <div>
        <h2 className="text-lg font-semibold">Available slots</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {openSlots?.map((slot) => (
            <li
              key={slot.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-800"
            >
              <span>
                {mentorName(slot.mentor_id)} · {new Date(slot.starts_at).toLocaleString()}
              </span>
              <BookSlotButton availabilityId={slot.id} />
            </li>
          ))}
        </ul>
        {!openSlots || openSlots.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No open slots right now - check back soon.</p>
        ) : null}
      </div>
    </div>
  );
}
