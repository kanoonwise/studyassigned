import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/** Every admin write goes through here so it lands in audit_log (who, what, before, after, when). */
export async function writeAuditLog(
  supabase: SupabaseClient<Database>,
  entry: {
    action: string;
    entity: string;
    entityKey: string | null;
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
  },
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("audit_log").insert({
    actor: user?.id ?? null,
    action: entry.action,
    entity: entry.entity,
    entity_key: entry.entityKey,
    before: entry.before,
    after: entry.after,
  });
}
