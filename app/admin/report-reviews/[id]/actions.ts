"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/db/audit";

export async function completeReview(reviewId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const update = {
    status: "completed" as const,
    top_sources: String(formData.get("top_sources") ?? "").trim() || null,
    references_vs_overlap: String(formData.get("references_vs_overlap") ?? "").trim() || null,
    self_plagiarism: String(formData.get("self_plagiarism") ?? "").trim() || null,
    first_fixes: String(formData.get("first_fixes") ?? "").trim() || null,
    reviewer_id: user?.id ?? null,
    completed_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("report_reviews").update(update).eq("id", reviewId);
  if (error) return { error: error.message };

  await writeAuditLog(supabase, {
    action: "complete",
    entity: "report_reviews",
    entityKey: reviewId,
    before: null,
    after: update,
  });

  revalidatePath(`/admin/report-reviews/${reviewId}`);
  revalidatePath("/admin/report-reviews");
  return { error: null };
}

export async function getReviewDocumentUrl(documentPath: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(documentPath, 300);
  if (error || !data) return { error: error?.message ?? "Could not create link.", url: null };
  return { error: null, url: data.signedUrl };
}
