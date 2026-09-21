"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/db/audit";
import { computeDiff, findVerifiedConflicts, type DiffResult } from "@/lib/import/diff";
import type {
  ParsedInstitutionRow,
  ParsedAuthorityRow,
  ParsedDeadlineRow,
  ParsedServicePriceRow,
} from "@/lib/import/parse-workbook";

const CHUNK_SIZE = 500;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export interface StagedWorkbook {
  institutions: ParsedInstitutionRow[];
  authorities: ParsedAuthorityRow[];
  deadlines: ParsedDeadlineRow[];
  servicePrices: ParsedServicePriceRow[];
}

export interface DiffSummary {
  batchId: string;
  institutions: { added: number; changed: number; removed: number };
  authorities: { added: number; changed: number; removed: number };
  servicePrices: { added: number; changed: number; removed: number };
  conflicts: ReturnType<typeof findVerifiedConflicts>;
  changedInstitutions: DiffResult<ParsedInstitutionRow>["changed"];
  changedAuthorities: DiffResult<ParsedAuthorityRow>["changed"];
}

export type StageResult = { ok: false; error: string } | { ok: true; summary: DiffSummary };

/** Stages a parsed workbook and returns a diff against the live tables - nothing is applied yet. */
export async function stageAndDiff(filename: string, data: StagedWorkbook): Promise<StageResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: batch, error: batchError } = await supabase
    .from("import_batches")
    .insert({ filename, uploaded_by: user?.id ?? null, state: "staged" })
    .select("id")
    .single();
  if (batchError || !batch) {
    return { ok: false, error: batchError?.message ?? "Could not create import batch." };
  }

  const batchId = batch.id;

  const asRecord = (row: object) => row as unknown as Record<string, unknown>;
  const stagingRows = [
    ...data.institutions.map((row) => ({
      batch_id: batchId,
      sheet: "institutions",
      key: row.aishe_code,
      row: asRecord(row),
    })),
    ...data.authorities.map((row) => ({
      batch_id: batchId,
      sheet: "authorities",
      key: row.aishe_code,
      row: asRecord(row),
    })),
    ...data.deadlines.map((row) => ({
      batch_id: batchId,
      sheet: "deadlines",
      key: `${row.authority_code}::${row.event_type}`,
      row: asRecord(row),
    })),
    ...data.servicePrices.map((row) => ({
      batch_id: batchId,
      sheet: "service_prices",
      key: row.service,
      row: asRecord(row),
    })),
  ];

  for (const batchChunk of chunk(stagingRows, CHUNK_SIZE)) {
    const { error } = await supabase.from("import_staging").insert(batchChunk);
    if (error) return { ok: false, error: error.message };
  }

  const [{ data: currentInstitutions }, { data: currentAuthorities }, { data: currentDeadlines }] =
    await Promise.all([
      supabase.from("institutions").select("*"),
      supabase.from("authorities").select("*"),
      supabase.from("deadlines").select("authority_code, event_type, status, exact_date"),
    ]);

  const institutionsDiff = computeDiff(
    data.institutions,
    (currentInstitutions ?? []) as unknown as ParsedInstitutionRow[],
    "aishe_code",
    ["name", "state", "district", "status", "affiliating_code", "affiliating_name"],
  );
  const authoritiesDiff = computeDiff(
    data.authorities,
    (currentAuthorities ?? []) as unknown as ParsedAuthorityRow[],
    "aishe_code",
    ["name", "state", "status", "calendar_url", "exam_url"],
  );
  const servicePricesDiff = computeDiff(
    data.servicePrices,
    [] as ParsedServicePriceRow[], // pricing is admin-curated; import only ever proposes additions
    "service",
    ["unit", "price_low", "price_high"],
  );

  const conflicts = findVerifiedConflicts(
    data.deadlines,
    (currentDeadlines ?? []) as {
      authority_code: string;
      event_type: string;
      status: string;
      exact_date: string | null;
    }[],
  );

  const summary: DiffSummary = {
    batchId,
    institutions: {
      added: institutionsDiff.added.length,
      changed: institutionsDiff.changed.length,
      removed: institutionsDiff.removed.length,
    },
    authorities: {
      added: authoritiesDiff.added.length,
      changed: authoritiesDiff.changed.length,
      removed: authoritiesDiff.removed.length,
    },
    servicePrices: {
      added: servicePricesDiff.added.length,
      changed: servicePricesDiff.changed.length,
      removed: servicePricesDiff.removed.length,
    },
    conflicts,
    changedInstitutions: institutionsDiff.changed,
    changedAuthorities: authoritiesDiff.changed,
  };

  await supabase
    .from("import_batches")
    .update({ summary: summary as unknown as Record<string, unknown> })
    .eq("id", batchId);

  revalidatePath("/admin/imports");
  return { ok: true, summary };
}

async function fetchStagedRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  batchId: string,
  sheet: string,
) {
  const rows: Record<string, unknown>[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("import_staging")
      .select("row")
      .eq("batch_id", batchId)
      .eq("sheet", sheet)
      .range(from, from + CHUNK_SIZE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []).map((r) => r.row as Record<string, unknown>));
    if (!data || data.length < CHUNK_SIZE) break;
    from += CHUNK_SIZE;
  }
  return rows;
}

/** Applies a staged batch: upserts institutions/authorities, snapshotting prior values for rollback. */
export async function approveBatch(batchId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();

  try {
    for (const [sheet, table] of [
      ["institutions", "institutions"],
      ["authorities", "authorities"],
    ] as const) {
      const rows = await fetchStagedRows(supabase, batchId, sheet);
      const keyField = "aishe_code";

      for (const row of rows) {
        const key = row[keyField] as string;
        const { data: before } = await supabase.from(table).select("*").eq(keyField, key).single();

        if (before) {
          await supabase.from("import_snapshots").insert({
            batch_id: batchId,
            sheet,
            key,
            before: before as unknown as Record<string, unknown>,
          });
        }

        const { error } = await supabase.from(table).upsert(row as never, { onConflict: keyField });
        if (error) throw new Error(`${sheet} ${key}: ${error.message}`);
      }
    }

    // New verified deadlines only - never overwrites an existing verified
    // row (that's a conflict the admin resolves via the Verification queue).
    const deadlineRows = (await fetchStagedRows(
      supabase,
      batchId,
      "deadlines",
    )) as unknown as (Record<string, unknown> & {
      status: string;
      authority_code: string;
      event_type: string;
    })[];
    for (const row of deadlineRows.filter((r) => r.status === "verified")) {
      const { data: existing } = await supabase
        .from("deadlines")
        .select("id")
        .eq("authority_code", row.authority_code)
        .eq("event_type", row.event_type)
        .eq("status", "verified")
        .maybeSingle();
      if (!existing) {
        await supabase.from("deadlines").insert(row as never);
      }
    }

    await supabase.from("import_batches").update({ state: "approved" }).eq("id", batchId);
    await writeAuditLog(supabase, {
      action: "approve",
      entity: "import_batches",
      entityKey: batchId,
      before: null,
      after: { state: "approved" },
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Approve failed." };
  }

  revalidatePath("/admin/imports");
  revalidatePath("/admin/institutions");
  revalidatePath("/admin/verification");
  return { error: null };
}

/** Restores institutions/authorities to their pre-import values for this batch. */
export async function rollbackBatch(batchId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: snapshots, error } = await supabase
    .from("import_snapshots")
    .select("sheet, key, before")
    .eq("batch_id", batchId);
  if (error) return { error: error.message };

  for (const snapshot of snapshots ?? []) {
    const table = snapshot.sheet as "institutions" | "authorities";
    const keyField = "aishe_code";
    await supabase
      .from(table)
      .update(snapshot.before as never)
      .eq(keyField, snapshot.key);
  }

  await supabase.from("import_batches").update({ state: "rolled_back" }).eq("id", batchId);
  await writeAuditLog(supabase, {
    action: "rollback",
    entity: "import_batches",
    entityKey: batchId,
    before: null,
    after: { state: "rolled_back" },
  });

  revalidatePath("/admin/imports");
  revalidatePath("/admin/institutions");
  return { error: null };
}
