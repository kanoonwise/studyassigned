import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { UgcLevelForm } from "./UgcLevelForm";

export const metadata: Metadata = {
  title: "UGC Similarity Level Calculator",
  description: "Find out what your similarity percentage means under the UGC regulations.",
};

export default async function UgcLevelToolPage() {
  const supabase = await createClient();
  const { data: levels } = await supabase
    .from("public_ugc_levels")
    .select("level, min_pct, max_pct, label, consequence, action_window_months")
    .order("level");

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">UGC Similarity Level Calculator</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Enter your similarity percentage to see what level it falls under and what typically happens
        next.
      </p>
      {levels && levels.length > 0 ? (
        <UgcLevelForm levels={levels} />
      ) : (
        <p className="mt-8 text-sm text-zinc-500">This tool is temporarily unavailable.</p>
      )}
      <p className="mt-8 text-sm text-zinc-500">
        Informational only. Your institution&apos;s own rules and official notices apply.
      </p>
    </div>
  );
}
