"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/db/audit";
import type { DeadlineStatus } from "@/lib/supabase/types";

// name/state are NOT NULL columns, so they fall back to the current value
// (never null) when left blank; the rest may be cleared to null.
const REQUIRED_TEXT_FIELDS = ["name", "state"] as const;
const NULLABLE_TEXT_FIELDS = [
  "district",
  "address",
  "website",
  "inst_type",
  "management",
  "affiliating_code",
  "affiliating_name",
  "urban_rural",
] as const;

function textValue(formData: FormData, field: string): string | null {
  const value = formData.get(field);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

export async function updateInstitution(aisheCode: string, formData: FormData) {
  const supabase = await createClient();

  const { data: before } = await supabase
    .from("institutions")
    .select("*")
    .eq("aishe_code", aisheCode)
    .single();

  const update: Partial<Record<(typeof NULLABLE_TEXT_FIELDS)[number], string | null>> &
    Partial<Record<(typeof REQUIRED_TEXT_FIELDS)[number], string>> & { status?: DeadlineStatus } =
    {};

  for (const field of REQUIRED_TEXT_FIELDS) {
    update[field] = textValue(formData, field) ?? before?.[field] ?? "";
  }
  for (const field of NULLABLE_TEXT_FIELDS) {
    update[field] = textValue(formData, field);
  }
  update.status = String(formData.get("status") ?? "") as DeadlineStatus;

  const { error } = await supabase.from("institutions").update(update).eq("aishe_code", aisheCode);
  if (error) {
    return { error: error.message };
  }

  await writeAuditLog(supabase, {
    action: "update",
    entity: "institutions",
    entityKey: aisheCode,
    before,
    after: { ...before, ...update },
  });

  revalidatePath(`/admin/institutions/${aisheCode}`);
  revalidatePath("/admin/institutions");
  return { error: null };
}
