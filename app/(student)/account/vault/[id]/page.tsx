import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildVaultTimeline, AUTHORSHIP_REPORT_DISCLAIMER } from "@/lib/vault";
import { UploadVersionForm } from "./UploadVersionForm";

export default async function VaultProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/account/vault/${id}`);

  const { data: project } = await supabase
    .from("vault_projects")
    .select("id, title, owner, created_at")
    .eq("id", id)
    .single();
  if (!project) notFound();

  const { data: documents } = await supabase
    .from("documents")
    .select("id, path, sha256, uploaded_at, version_label")
    .eq("vault_project_id", id)
    .order("uploaded_at", { ascending: true });

  const timeline = buildVaultTimeline(documents ?? []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/account/vault" className="text-primary text-sm hover:underline">
          &larr; Writing Proof Vault
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{project.title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{AUTHORSHIP_REPORT_DISCLAIMER}</p>
      </div>

      {timeline.length > 0 ? (
        <a
          href={`/api/vault/${project.id}/report`}
          className="self-start rounded-full border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
        >
          Download Authorship Evidence Report (PDF)
        </a>
      ) : null}

      <ol className="flex flex-col gap-4">
        {timeline.map((entry) => (
          <li
            key={entry.id}
            className="rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800"
          >
            <p className="font-medium">
              {entry.version}. {entry.label}
            </p>
            <p className="mt-1 text-zinc-500">{entry.filename}</p>
            <p className="text-xs text-zinc-500">
              Uploaded {new Date(entry.uploadedAt).toLocaleString()}
            </p>
            <p className="mt-1 font-mono text-xs break-all text-zinc-400">
              SHA-256: {entry.sha256 ?? "not recorded"}
            </p>
          </li>
        ))}
      </ol>
      {timeline.length === 0 ? (
        <p className="text-sm text-zinc-500">No versions uploaded yet.</p>
      ) : null}

      <UploadVersionForm projectId={project.id} />
    </div>
  );
}
