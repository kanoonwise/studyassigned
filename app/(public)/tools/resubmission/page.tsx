import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ResubmissionForm } from "./ResubmissionForm";

export const metadata: Metadata = {
  title: "Resubmission Deadline Calculator",
  description: "Work out your last resubmission date and a week-by-week plan to get there.",
};

export default async function ResubmissionToolPage() {
  const supabase = await createClient();
  const { data: levels } = await supabase
    .from("public_ugc_levels")
    .select("level, label, action_window_months")
    .order("level");

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Resubmission Deadline Calculator</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Enter your report date and level to see your last resubmission date and a plan by week.
      </p>
      {levels && levels.length > 0 ? (
        <ResubmissionForm levels={levels} />
      ) : (
        <p className="mt-8 text-sm text-zinc-500">This tool is temporarily unavailable.</p>
      )}
      <p className="mt-8 text-sm text-zinc-500">
        Informational only. Your institution&apos;s own rules and official notices apply.
      </p>
    </div>
  );
}
