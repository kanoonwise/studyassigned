import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { summarizeMentorWorkload } from "@/lib/mentor";
import { AddAvailabilityForm } from "./AddAvailabilityForm";
import { AvailabilityRow } from "./AvailabilityRow";
import { BookingCard } from "./BookingCard";

export const metadata: Metadata = { title: "Mentor Dashboard" };

export default async function MentorDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: availability }, { data: bookings }] = await Promise.all([
    supabase
      .from("mentor_availability")
      .select("id, starts_at, ends_at, is_booked")
      .eq("mentor_id", user.id)
      .order("starts_at", { ascending: true }),
    supabase
      .from("mentor_bookings")
      .select("id, student_id, status, created_at, availability_id")
      .eq("mentor_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const studentIds = [...new Set((bookings ?? []).map((b) => b.student_id))];
  const { data: students } =
    studentIds.length > 0
      ? await supabase.from("profiles").select("id, full_name, email").in("id", studentIds)
      : { data: [] };
  const studentName = (id: string) => {
    const student = students?.find((s) => s.id === id);
    return student?.full_name || student?.email || "Student";
  };

  const slotTime = (availabilityId: string) => availability?.find((a) => a.id === availabilityId);

  const workload = summarizeMentorWorkload(
    (bookings ?? []).map((b) => ({ mentor_id: user.id, status: b.status })),
  )[0];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Mentor dashboard</h1>
        {workload ? (
          <p className="mt-1 text-sm text-zinc-500">
            {workload.scheduled} scheduled · {workload.completed} completed · {workload.cancelled}{" "}
            cancelled
          </p>
        ) : null}
      </div>

      <div>
        <h2 className="text-lg font-semibold">My bookings</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {bookings?.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              slot={slotTime(booking.availability_id)}
              studentName={studentName(booking.student_id)}
            />
          ))}
        </ul>
        {!bookings || bookings.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No bookings yet.</p>
        ) : null}
      </div>

      <div>
        <h2 className="text-lg font-semibold">My availability</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {availability?.map((slot) => (
            <AvailabilityRow key={slot.id} slot={slot} />
          ))}
        </ul>
        {!availability || availability.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No slots published yet.</p>
        ) : null}
        <div className="mt-4">
          <AddAvailabilityForm />
        </div>
      </div>
    </div>
  );
}
