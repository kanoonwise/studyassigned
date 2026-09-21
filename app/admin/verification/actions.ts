"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/db/audit";
import { sendDeadlineVerifiedNotification } from "@/lib/email";

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

  const { data: coveredInstitutions, error: institutionsError } = await supabase
    .from("institutions")
    .update({ status: "verified" })
    .eq("calendar_authority_code", authorityCode)
    .select("aishe_code, name");
  if (institutionsError) return { error: institutionsError.message };

  await queueDeadlineAlerts(supabase, coveredInstitutions ?? [], eventType, exactDate);

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

async function queueDeadlineAlerts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  institutions: { aishe_code: string; name: string }[],
  eventType: string,
  exactDate: string,
) {
  const codes = institutions.map((i) => i.aishe_code);
  if (codes.length === 0) return;

  const { data: alerts } = await supabase
    .from("deadline_alerts")
    .select("id, institution_code, contact")
    .in("institution_code", codes)
    .is("notified_at", null);

  for (const alert of alerts ?? []) {
    const institution = institutions.find((i) => i.aishe_code === alert.institution_code);
    await sendDeadlineVerifiedNotification(
      alert.contact,
      institution?.name ?? "Your institution",
      eventType,
      exactDate,
    );
    await supabase
      .from("deadline_alerts")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", alert.id);
  }
}
