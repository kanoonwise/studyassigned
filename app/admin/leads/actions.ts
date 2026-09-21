"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/db/audit";

export async function toggleHandled(leadId: string, handled: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ handled_at: handled ? new Date().toISOString() : null })
    .eq("id", leadId);
  if (error) return { error: error.message };

  await writeAuditLog(supabase, {
    action: handled ? "mark_handled" : "mark_unhandled",
    entity: "leads",
    entityKey: leadId,
    before: null,
    after: { handled },
  });

  revalidatePath("/admin/leads");
  return { error: null };
}
