"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sanitizeReferralCode } from "@/lib/referral";
import { writeAuditLog } from "@/lib/db/audit";

export async function createReferralCode(formData: FormData) {
  const code = sanitizeReferralCode(String(formData.get("code") ?? ""));
  const ownerName = String(formData.get("ownerName") ?? "").trim();
  if (!code) return { error: "Enter a code (letters, numbers, - and _)." };
  if (!ownerName) return { error: "Enter who this code belongs to." };

  const supabase = await createClient();
  const { error } = await supabase.from("referral_codes").insert({ code, owner_name: ownerName });
  if (error) return { error: error.message };

  await writeAuditLog(supabase, {
    action: "create",
    entity: "referral_codes",
    entityKey: code,
    before: null,
    after: { code, owner_name: ownerName },
  });
  revalidatePath("/admin/referrals");
  return { error: null };
}

export async function toggleReferralCode(code: string, active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("referral_codes").update({ active }).eq("code", code);
  if (error) return { error: error.message };

  revalidatePath("/admin/referrals");
  return { error: null };
}
