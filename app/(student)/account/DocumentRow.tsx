"use client";

import { useState } from "react";
import { deleteDocument, getSignedDownloadUrl, requestReportReview } from "./actions";

interface Document {
  id: string;
  path: string;
  uploaded_at: string;
  delete_after: string | null;
}

export function DocumentRow({ document }: { document: Document }) {
  const [busy, setBusy] = useState(false);
  const [requested, setRequested] = useState(false);
  const filename = document.path.split("/").pop();

  async function handleDownload() {
    setBusy(true);
    const result = await getSignedDownloadUrl(document.id);
    setBusy(false);
    if (result.url) window.open(result.url, "_blank", "noopener,noreferrer");
  }

  async function handleDelete() {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    setBusy(true);
    await deleteDocument(document.id);
  }

  async function handleRequestReview() {
    setBusy(true);
    const result = await requestReportReview(document.id);
    setBusy(false);
    if (!result.error) setRequested(true);
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 py-3 text-sm dark:border-zinc-900">
      <div>
        <p>{filename}</p>
        <p className="text-xs text-zinc-500">
          Uploaded {new Date(document.uploaded_at).toLocaleDateString()}
          {document.delete_after ? ` · kept until ${document.delete_after}` : ""}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={busy}
          className="rounded-full border border-zinc-300 px-3 py-1 dark:border-zinc-700"
        >
          Download
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className="rounded-full border border-red-300 px-3 py-1 text-red-700 dark:border-red-900 dark:text-red-400"
        >
          Delete
        </button>
        {requested ? (
          <span className="px-3 py-1 text-zinc-500">Decode requested</span>
        ) : (
          <button
            type="button"
            onClick={handleRequestReview}
            disabled={busy}
            className="rounded-full border border-zinc-300 px-3 py-1 dark:border-zinc-700"
          >
            Request report decode
          </button>
        )}
      </div>
    </li>
  );
}
