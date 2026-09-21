import { CreateCodeForm } from "./CreateCodeForm";
import { ToggleCodeButton } from "./ToggleCodeButton";
import { createClient } from "@/lib/supabase/server";

export default async function AdminReferralsPage() {
  const supabase = await createClient();
  const [{ data: codes }, { data: leads }] = await Promise.all([
    supabase.from("referral_codes").select("*").order("created_at", { ascending: false }),
    supabase.from("leads").select("referral_code").not("referral_code", "is", null),
  ]);

  const counts = new Map<string, number>();
  for (const lead of leads ?? []) {
    if (!lead.referral_code) continue;
    counts.set(lead.referral_code, (counts.get(lead.referral_code) ?? 0) + 1);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Campus referrals</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Codes for campus ambassadors. A visit with <code>?ref=CODE</code> is remembered for 30 days
        and attributed on the enquiry it produces, if any.
      </p>

      <CreateCodeForm />

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
              <th className="py-2 pr-4">Code</th>
              <th className="py-2 pr-4">Owner</th>
              <th className="py-2 pr-4">Leads attributed</th>
              <th className="py-2 pr-4">Active</th>
            </tr>
          </thead>
          <tbody>
            {codes?.map((row) => (
              <tr key={row.code} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2 pr-4 font-mono">{row.code}</td>
                <td className="py-2 pr-4">{row.owner_name}</td>
                <td className="py-2 pr-4">{counts.get(row.code) ?? 0}</td>
                <td className="py-2 pr-4">
                  <ToggleCodeButton code={row.code} active={row.active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!codes || codes.length === 0 ? (
          <p className="py-4 text-sm text-zinc-500">No referral codes yet.</p>
        ) : null}
      </div>
    </div>
  );
}
