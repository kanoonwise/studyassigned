import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminReportReviewsPage() {
  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("report_reviews")
    .select("id, status, created_at, document_id")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-xl font-semibold">Similarity report decode requests</h1>
      <ul className="mt-6 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-900">
        {reviews?.map((review) => (
          <li key={review.id} className="py-3 text-sm">
            <Link
              href={`/admin/report-reviews/${review.id}`}
              className="underline-offset-4 hover:underline"
            >
              {new Date(review.created_at).toLocaleString()}
            </Link>
            <span className="ml-2 text-zinc-500">{review.status}</span>
          </li>
        ))}
      </ul>
      {!reviews || reviews.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">No requests yet.</p>
      ) : null}
    </div>
  );
}
