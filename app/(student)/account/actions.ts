"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAllowedDocumentType, computeDeleteAfter, MAX_DOCUMENT_BYTES } from "@/lib/documents";
import { sendOrderStatusEmail } from "@/lib/email";

const BUCKET = "documents";

export async function createOrder(formData: FormData) {
  const service = String(formData.get("service") ?? "").trim();
  if (!service) return { error: "Choose a service." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: order, error } = await supabase
    .from("orders")
    .insert({ student_id: user.id, service, status: "submitted" })
    .select("id")
    .single();
  if (error) return { error: error.message };

  await supabase
    .from("order_events")
    .insert({ order_id: order.id, event: "submitted", by: user.id });
  await sendOrderStatusEmail(user.email ?? "", service, "submitted").catch(() => {});

  revalidatePath("/account");
  return { error: null };
}

export async function uploadDocument(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Choose a file to upload." };
  }
  if (!isAllowedDocumentType(file.type)) {
    return { error: "Only PDF and DOCX files are accepted." };
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return { error: "File is larger than the 20MB limit." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const path = `${user.id}/${Date.now()}-${file.name}`;

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
  });
  if (insertError) {
    await supabase.storage.from(BUCKET).remove([path]);
    return { error: insertError.message };
  }

  revalidatePath("/account");
  return { error: null };
}

export async function deleteDocument(documentId: string) {
  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("documents")
    .select("path")
    .eq("id", documentId)
    .single();
  if (!doc) return { error: "Document not found." };

  await supabase.storage.from(BUCKET).remove([doc.path]);
  const { error } = await supabase.from("documents").delete().eq("id", documentId);
  if (error) return { error: error.message };

  revalidatePath("/account");
  return { error: null };
}

export async function requestReportReview(documentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase.from("report_reviews").insert({
    document_id: documentId,
    student_id: user.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/account");
  return { error: null };
}

export async function getSignedDownloadUrl(documentId: string) {
  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("documents")
    .select("path")
    .eq("id", documentId)
    .single();
  if (!doc) return { error: "Document not found.", url: null };

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(doc.path, 300);
  if (error || !data) return { error: error?.message ?? "Could not create link.", url: null };

  return { error: null, url: data.signedUrl };
}
