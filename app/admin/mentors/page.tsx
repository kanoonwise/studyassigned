import { createClient } from "@/lib/supabase/server";
import { summarizeMentorWorkload } from "@/lib/mentor";

export default async function AdminMentorsPage() {
  const supabase = await createClient();
  const { data: bookings } = await supabase.from("mentor_bookings").select("mentor_id, status");
  const workload = summarizeMentorWorkload(bookings ?? []);

  const mentorIds = workload.map((w) => w.mentorId);
  const { data: mentors } =
    mentorIds.length > 0
      ? await supabase.from("profiles").select("id, full_name, email").in("id", mentorIds)
      : { data: [] };
  const mentorName = (id: string) => {
    const mentor = mentors?.find((m) => m.id === id);
    return mentor?.full_name || mentor?.email || id;
  };

  return (
    <div>
      <h1 className="text-xl font-semibold">Mentor workload</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
              <th className="py-2 pr-4">Mentor</th>
              <th className="py-2 pr-4">Scheduled</th>
              <th className="py-2 pr-4">Completed</th>
              <th className="py-2 pr-4">Cancelled</th>
              <th className="py-2 pr-4">Total</th>
            </tr>
          </thead>
          <tbody>
            {workload.map((row) => (
              <tr key={row.mentorId} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2 pr-4">{mentorName(row.mentorId)}</td>
                <td className="py-2 pr-4">{row.scheduled}</td>
                <td className="py-2 pr-4">{row.completed}</td>
                <td className="py-2 pr-4">{row.cancelled}</td>
                <td className="py-2 pr-4">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {workload.length === 0 ? (
          <p className="py-4 text-sm text-zinc-500">No mentor bookings yet.</p>
        ) : null}
      </div>
    </div>
  );
}
