"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/db/audit";

export async function assignOwner(authorityCode: string, owner: string) {
  const supabase = await createClient();
  const { data: before } = await supabase
    .from("authorities")
    .select("owner")
    .eq("aishe_code", authorityCode)
    .single();

  const { error } = await supabase
    .from("authorities")
    .update({ owner: owner || null })
    .eq("aishe_code", authorityCode);
  if (error) return { error: error.message };

  await writeAuditLog(supabase, {
    action: "assign_owner",
    entity: "authorities",
    entityKey: authorityCode,
    before,
    after: { owner },
  });

  revalidatePath("/admin/verification");
  return { error: null };
}

export async function markVerified(authorityCode: string, formData: FormData) {
  const supabase = await createClient();
  const eventType = String(formData.get("eventType") ?? "").trim();
  const exactDate = String(formData.get("exactDate") ?? "").trim();
  const evidenceUrl = String(formData.get("evidenceUrl") ?? "").trim();

  if (!eventType || !exactDate || !evidenceUrl) {
    return { error: "Event type, date and evidence URL are all required." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: deadline, error: deadlineError } = await supabase
    .from("deadlines")
    .insert({
      authority_code: authorityCode,
      event_type: eventType,
      exact_date: exactDate,
      status: "verified",
      evidence_url: evidenceUrl,
      verified_by: user?.id ?? null,
      verified_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (deadlineError) return { error: deadlineError.message };

  const { data: authorityBefore } = await supabase
    .from("authorities")
    .select("status, last_checked")
    .eq("aishe_code", authorityCode)
    .single();

  const { error: authorityError } = await supabase
    .from("authorities")
    .update({ status: "verified", last_checked: new Date().toISOString().slice(0, 10) })
    .eq("aishe_code", authorityCode);
  if (authorityError) return { error: authorityError.message };

  const { error: institutionsError } = await supabase
    .from("institutions")
    .update({ status: "verified" })
    .eq("calendar_authority_code", authorityCode);
  if (institutionsError) return { error: institutionsError.message };

  await writeAuditLog(supabase, {
    action: "mark_verified",
    entity: "authorities",
    entityKey: authorityCode,
    before: authorityBefore,
    after: {
      status: "verified",
      deadline_id: deadline?.id,
      event_type: eventType,
      exact_date: exactDate,
    },
  });

  revalidatePath("/admin/verification");
  revalidatePath("/admin/institutions");
  return { error: null };
}
