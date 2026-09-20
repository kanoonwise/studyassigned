import { createClient } from "@/lib/supabase/server";
import { VerificationRow } from "./VerificationRow";

export default async function VerificationQueuePage() {
  const supabase = await createClient();
  const { data: authorities } = await supabase
    .from("authorities")
    .select(
      "aishe_code, name, state, active_covered, calendar_url, exam_url, status, owner, last_checked",
    )
    .order("active_covered", { ascending: false, nullsFirst: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-xl font-semibold">Verification queue</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Sorted by how many institutions each authority covers.
      </p>

      <div className="mt-6 flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
        {authorities?.map((authority) => (
          <VerificationRow key={authority.aishe_code} authority={authority} />
        ))}
      </div>
    </div>
  );
}
