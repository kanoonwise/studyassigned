"use client";

import { useRef, useState } from "react";
import { uploadDocument } from "./actions";

export function UploadForm() {
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function action(formData: FormData) {
    setStatus("uploading");
    setError(null);
    const result = await uploadDocument(formData);
    if (result.error) {
      setError(result.error);
      setStatus("error");
      return;
    }
    formRef.current?.reset();
    setStatus("idle");
  }

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-2 text-sm">
      <input type="file" name="file" accept=".pdf,.docx" required />
      <button
        type="submit"
        disabled={status === "uploading"}
        className="self-start rounded-full bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {status === "uploading" ? "Uploading…" : "Upload"}
      </button>
      {error ? <p className="text-red-600">{error}</p> : null}
      <p className="text-xs text-zinc-500">PDF or DOCX, up to 20MB.</p>
    </form>
  );
}
