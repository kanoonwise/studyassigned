"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/db/audit";
import { sendOrderStatusEmail } from "@/lib/email";
import { isAllowedDocumentType, computeDeleteAfter, MAX_DOCUMENT_BYTES } from "@/lib/documents";
import type { OrderStatus } from "@/lib/supabase/types";

const BUCKET = "documents";

export async function uploadDelivery(orderId: string, formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Choose a file to upload." };
  if (!isAllowedDocumentType(file.type)) return { error: "Only PDF and DOCX files are accepted." };
  if (file.size > MAX_DOCUMENT_BYTES) return { error: "File is larger than the 20MB limit." };

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("student_id")
    .eq("id", orderId)
    .single();
  if (!order?.student_id) return { error: "Order has no student to deliver to." };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const path = `${order.student_id}/delivery-${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) return { error: uploadError.message };

  const { error: insertError } = await supabase.from("documents").insert({
    owner: order.student_id,
    order_id: orderId,
    path,
    sha256,
    delete_after: computeDeleteAfter(new Date()),
  });
  if (insertError) {
    await supabase.storage.from(BUCKET).remove([path]);
    return { error: insertError.message };
  }

  await supabase.from("order_events").insert({ order_id: orderId, event: "delivery_uploaded" });
  revalidatePath(`/admin/orders/${orderId}`);
  return { error: null };
}

export async function updateOrder(orderId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: before } = await supabase.from("orders").select("*").eq("id", orderId).single();
  if (!before) return { error: "Order not found." };

  const status = String(formData.get("status") ?? before.status) as OrderStatus;
  const quoteRaw = formData.get("quote");
  const dueDateRaw = String(formData.get("due_date") ?? "").trim();

  const update = {
    status,
    quote: quoteRaw && String(quoteRaw).trim() !== "" ? Number(quoteRaw) : before.quote,
    due_date: dueDateRaw || null,
  };

  const { error } = await supabase.from("orders").update(update).eq("id", orderId);
  if (error) return { error: error.message };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (status !== before.status) {
    await supabase
      .from("order_events")
      .insert({ order_id: orderId, event: `status:${status}`, by: user?.id ?? null });

    const { data: student } = before.student_id
      ? await supabase.from("profiles").select("email").eq("id", before.student_id).single()
      : { data: null };
    await sendOrderStatusEmail(student?.email ?? "", before.service ?? "your order", status).catch(
      () => {},
    );
  }

  await writeAuditLog(supabase, {
    action: "update",
    entity: "orders",
    entityKey: orderId,
    before,
    after: { ...before, ...update },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { error: null };
}

export async function addOrderNote(orderId: string, note: string) {
  if (!note.trim()) return { error: "Note is empty." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("order_events")
    .insert({ order_id: orderId, event: `note: ${note.trim()}`, by: user?.id ?? null });
  if (error) return { error: error.message };

  revalidatePath(`/admin/orders/${orderId}`);
  return { error: null };
}

export async function refundOrder(orderId: string) {
  const supabase = await createClient();
  const { data: before } = await supabase.from("orders").select("*").eq("id", orderId).single();
  if (!before) return { error: "Order not found." };

  const { error } = await supabase.from("orders").update({ status: "refunded" }).eq("id", orderId);
  if (error) return { error: error.message };

  await supabase.from("order_events").insert({ order_id: orderId, event: "status:refunded" });
  await writeAuditLog(supabase, {
    action: "refund",
    entity: "orders",
    entityKey: orderId,
    before,
    after: { status: "refunded" },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  return { error: null };
}
