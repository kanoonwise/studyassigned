"use client";

import { useState } from "react";
import { completeReview, getReviewDocumentUrl } from "./actions";

interface Review {
  id: string;
  document_path: string;
  top_sources: string | null;
  references_vs_overlap: string | null;
  self_plagiarism: string | null;
  first_fixes: string | null;
}

export function ReviewForm({ review }: { review: Review }) {
  const [saved, setSaved] = useState(false);

  async function handleOpenDocument() {
    const result = await getReviewDocumentUrl(review.document_path);
    if (result.url) window.open(result.url, "_blank", "noopener,noreferrer");
  }

  async function action(formData: FormData) {
    const result = await completeReview(review.id, formData);
    setSaved(!result.error);
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={handleOpenDocument}
        className="self-start rounded-full border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
      >
        Open report
      </button>

      <form action={action} className="flex flex-col gap-3 text-sm">
        <label className="flex flex-col gap-1">
          Top matching sources
          <textarea
            name="top_sources"
            defaultValue={review.top_sources ?? ""}
            rows={2}
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1">
          References vs real overlap
          <textarea
            name="references_vs_overlap"
            defaultValue={review.references_vs_overlap ?? ""}
            rows={2}
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1">
          Self-plagiarism
          <textarea
            name="self_plagiarism"
            defaultValue={review.self_plagiarism ?? ""}
            rows={2}
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1">
          First fixes
          <textarea
            name="first_fixes"
            defaultValue={review.first_fixes ?? ""}
            rows={2}
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700"
          />
        </label>
        <button
          type="submit"
          className="self-start rounded-full bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Mark completed
        </button>
        {saved ? <span className="text-green-700 dark:text-green-400">Saved.</span> : null}
      </form>
    </div>
  );
}
