"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAllowedDocumentType, computeDeleteAfter, MAX_DOCUMENT_BYTES } from "@/lib/documents";

const BUCKET = "documents";

export async function createVaultProject(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Give your project a title." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase.from("vault_projects").insert({ owner: user.id, title });
  if (error) return { error: error.message };

  revalidatePath("/account/vault");
  return { error: null };
}

export async function uploadVaultVersion(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");
  const versionLabel = String(formData.get("versionLabel") ?? "").trim() || null;
  const file = formData.get("file");
  if (!projectId) return { error: "Missing project." };
  if (!(file instanceof File)) return { error: "Choose a file to upload." };
  if (!isAllowedDocumentType(file.type)) return { error: "Only PDF and DOCX files are accepted." };
  if (file.size > MAX_DOCUMENT_BYTES) return { error: "File is larger than the 20MB limit." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const path = `${user.id}/vault-${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) return { error: uploadError.message };

  const { error: insertError } = await supabase.from("documents").insert({
    owner: user.id,
    path,
    sha256,
    delete_after: computeDeleteAfter(new Date()),
    vault_project_id: projectId,
    version_label: versionLabel,
  });
  if (insertError) {
    await supabase.storage.from(BUCKET).remove([path]);
    return { error: insertError.message };
  }

  revalidatePath(`/account/vault/${projectId}`);
  return { error: null };
}
