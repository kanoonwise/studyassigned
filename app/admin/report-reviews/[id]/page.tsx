import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReviewForm } from "./ReviewForm";

export default async function AdminReportReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: review } = await supabase.from("report_reviews").select("*").eq("id", id).single();
  if (!review) notFound();

  const { data: document } = await supabase
    .from("documents")
    .select("path")
    .eq("id", review.document_id)
    .single();
  if (!document) notFound();

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold">Report decode request</h1>
      <p className="text-sm text-zinc-500">Status: {review.status}</p>
      <div className="mt-6">
        <ReviewForm review={{ ...review, document_path: document.path }} />
      </div>
    </div>
  );
}
