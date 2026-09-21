import { createClient } from "@/lib/supabase/server";
import { LeadRow } from "./LeadRow";

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ flagged?: string; handled?: string }>;
}) {
  const { flagged, handled } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (flagged === "1") query = query.eq("flagged", true);
  if (handled === "0") query = query.is("handled_at", null);

  const { data: leads } = await query;

  return (
    <div>
      <h1 className="text-xl font-semibold">Leads</h1>

      <form className="mt-4 flex gap-4 text-sm">
        <label className="flex items-center gap-1">
          <input type="checkbox" name="flagged" value="1" defaultChecked={flagged === "1"} />{" "}
          Flagged only
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" name="handled" value="0" defaultChecked={handled === "0"} />{" "}
          Unhandled only
        </label>
        <button
          type="submit"
          className="rounded bg-zinc-900 px-4 py-1.5 text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Filter
        </button>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Contact</th>
              <th className="py-2 pr-4">Service</th>
              <th className="py-2 pr-4">Flag</th>
              <th className="py-2 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {leads?.map((lead) => (
              <LeadRow key={lead.id} lead={lead} />
            ))}
          </tbody>
        </table>
        {!leads || leads.length === 0 ? (
          <p className="py-4 text-sm text-zinc-500">No leads match this filter.</p>
        ) : null}
      </div>
    </div>
  );
}
