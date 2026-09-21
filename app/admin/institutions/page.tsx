import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { DeadlineStatus } from "@/lib/supabase/types";

const STATUSES: DeadlineStatus[] = [
  "verified",
  "link_found",
  "proxy",
  "seasonality_only",
  "manual_required",
];

export default async function AdminInstitutionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string; kind?: string; status?: string }>;
}) {
  const { q, state, kind, status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("institutions")
    .select("aishe_code, kind, name, state, district, status, last_checked")
    .order("name")
    .limit(200);

  if (q) query = query.ilike("name", `%${q}%`);
  if (state) query = query.eq("state", state);
  if (kind) query = query.eq("kind", kind);
  if (status) query = query.eq("status", status as DeadlineStatus);

  const { data: institutions } = await query;

  return (
    <div>
      <h1 className="text-xl font-semibold">Institutions</h1>

      <form className="mt-4 flex flex-wrap gap-2 text-sm">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by name"
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
        />
        <input
          type="text"
          name="state"
          defaultValue={state}
          placeholder="State"
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
        />
        <select
          name="kind"
          defaultValue={kind ?? ""}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
        >
          <option value="">All kinds</option>
          <option value="College">College</option>
          <option value="University">University</option>
        </select>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Filter
        </button>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
              <th className="py-2 pr-4">AISHE Code</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Kind</th>
              <th className="py-2 pr-4">State</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Last checked</th>
            </tr>
          </thead>
          <tbody>
            {institutions?.map((inst) => (
              <tr key={inst.aishe_code} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2 pr-4">{inst.aishe_code}</td>
                <td className="py-2 pr-4">
                  <Link
                    href={`/admin/institutions/${inst.aishe_code}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {inst.name}
                  </Link>
                </td>
                <td className="py-2 pr-4">{inst.kind}</td>
                <td className="py-2 pr-4">{inst.state}</td>
                <td className="py-2 pr-4">{inst.status}</td>
                <td className="py-2 pr-4">{inst.last_checked ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!institutions || institutions.length === 0 ? (
          <p className="py-4 text-sm text-zinc-500">No institutions match this filter.</p>
        ) : null}
      </div>
    </div>
  );
}
