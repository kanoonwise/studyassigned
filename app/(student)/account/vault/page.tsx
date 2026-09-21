import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { NewProjectForm } from "./NewProjectForm";

export const metadata: Metadata = { title: "Writing Proof Vault" };

export default async function VaultPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/vault");

  const [{ data: projects }, { data: documents }] = await Promise.all([
    supabase
      .from("vault_projects")
      .select("id, title, created_at")
      .eq("owner", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("documents").select("vault_project_id").eq("owner", user.id),
  ]);
  const versionCounts = new Map<string, number>();
  for (const doc of documents ?? []) {
    if (!doc.vault_project_id) continue;
    versionCounts.set(doc.vault_project_id, (versionCounts.get(doc.vault_project_id) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/account" className="text-primary text-sm hover:underline">
          &larr; My account
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Writing Proof Vault</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Every version you upload is timestamped and hashed. This is supporting evidence of your
          own writing process over time, not proof of originality or a promised result.
        </p>
      </div>

      <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-900">
        {projects?.map((project) => (
          <li key={project.id} className="py-3 text-sm">
            <Link
              href={`/account/vault/${project.id}`}
              className="font-medium underline-offset-4 hover:underline"
            >
              {project.title}
            </Link>
            <p className="text-zinc-500">
              {versionCounts.get(project.id) ?? 0} version(s) · started{" "}
              {new Date(project.created_at).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
      {!projects || projects.length === 0 ? (
        <p className="text-sm text-zinc-500">No projects yet.</p>
      ) : null}

      <NewProjectForm />
    </div>
  );
}
