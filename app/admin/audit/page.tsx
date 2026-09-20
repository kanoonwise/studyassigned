import { createClient } from "@/lib/supabase/server";

export default async function AuditLogPage() {
  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("audit_log")
    .select("id, actor, action, entity, entity_key, at")
    .order("at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-xl font-semibold">Audit log</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
              <th className="py-2 pr-4">When</th>
              <th className="py-2 pr-4">Actor</th>
              <th className="py-2 pr-4">Action</th>
              <th className="py-2 pr-4">Entity</th>
              <th className="py-2 pr-4">Key</th>
            </tr>
          </thead>
          <tbody>
            {entries?.map((entry) => (
              <tr key={entry.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2 pr-4">{new Date(entry.at).toLocaleString()}</td>
                <td className="py-2 pr-4 font-mono text-xs">{entry.actor ?? "-"}</td>
                <td className="py-2 pr-4">{entry.action}</td>
                <td className="py-2 pr-4">{entry.entity}</td>
                <td className="py-2 pr-4">{entry.entity_key ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!entries || entries.length === 0 ? (
          <p className="py-4 text-sm text-zinc-500">No activity yet.</p>
        ) : null}
      </div>
    </div>
  );
}
