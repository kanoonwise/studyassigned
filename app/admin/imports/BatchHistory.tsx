"use client";

import { useState } from "react";
import { rollbackBatch } from "./actions";

interface Batch {
  id: string;
  filename: string | null;
  uploaded_at: string;
  state: string;
}

export function BatchHistory({ batches }: { batches: Batch[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleRollback(id: string) {
    setBusyId(id);
    await rollbackBatch(id);
    setBusyId(null);
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
          <th className="py-2 pr-4">Uploaded</th>
          <th className="py-2 pr-4">File</th>
          <th className="py-2 pr-4">State</th>
          <th className="py-2 pr-4"></th>
        </tr>
      </thead>
      <tbody>
        {batches.map((batch) => (
          <tr key={batch.id} className="border-b border-zinc-100 dark:border-zinc-900">
            <td className="py-2 pr-4">{new Date(batch.uploaded_at).toLocaleString()}</td>
            <td className="py-2 pr-4">{batch.filename ?? "-"}</td>
            <td className="py-2 pr-4">{batch.state}</td>
            <td className="py-2 pr-4">
              {batch.state === "approved" ? (
                <button
                  type="button"
                  disabled={busyId === batch.id}
                  onClick={() => handleRollback(batch.id)}
                  className="rounded-full border border-zinc-300 px-3 py-1 text-xs disabled:opacity-50 dark:border-zinc-700"
                >
                  {busyId === batch.id ? "Rolling back…" : "Roll back"}
                </button>
              ) : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
