"use client";

import { useRef, useState } from "react";
import { uploadVaultVersion } from "../actions";

export function UploadVersionForm({ projectId }: { projectId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function action(formData: FormData) {
    setBusy(true);
    setError(null);
    const result = await uploadVaultVersion(formData);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-2 text-sm">
      <input type="hidden" name="projectId" value={projectId} />
      <input
        type="text"
        name="versionLabel"
        placeholder="Version label (optional), e.g. Draft after supervisor feedback"
        className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
      />
      <input type="file" name="file" accept=".pdf,.docx" required />
      <button
        type="submit"
        disabled={busy}
        className="bg-primary text-primary-foreground self-start rounded-full px-4 py-2 disabled:opacity-50"
      >
        {busy ? "Uploading…" : "Add this version"}
      </button>
      {error ? <p className="text-red-600">{error}</p> : null}
      <p className="text-xs text-zinc-500">PDF or DOCX, up to 20MB.</p>
    </form>
  );
}
