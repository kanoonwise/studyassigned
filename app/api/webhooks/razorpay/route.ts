import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        status: string;
      };
    };
  };
}

export async function POST(request: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  if (!signature || !verifyWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const body = JSON.parse(rawBody) as RazorpayWebhookPayload;
  if (body.event !== "payment.captured") {
    return NextResponse.json({ ok: true }); // Acknowledged, nothing to do.
  }

  const { id: paymentId, order_id: razorpayOrderId } = body.payload.payment.entity;

  // Service role: a webhook has no user session, and idempotency needs to
  // see the payment row regardless of RLS.
  const supabase = createAdminClient();

  const { data: payment } = await supabase
    .from("payments")
    .select("id, order_id, milestone, razorpay_payment_id")
    .eq("razorpay_order_id", razorpayOrderId)
    .single();
  if (!payment) {
    return NextResponse.json({ error: "Unknown order." }, { status: 404 });
  }
  if (payment.razorpay_payment_id === paymentId) {
    return NextResponse.json({ ok: true }); // Already processed - duplicate webhook delivery.
  }
  if (!payment.order_id) {
    return NextResponse.json({ error: "Payment has no linked order." }, { status: 500 });
  }

  await supabase
    .from("payments")
    .update({ razorpay_payment_id: paymentId, status: "captured" })
    .eq("id", payment.id);

  await supabase.from("order_events").insert({
    order_id: payment.order_id,
    event: `payment_captured:${payment.milestone}`,
  });

  if (payment.milestone === "deposit") {
    await supabase
      .from("orders")
      .update({ status: "paid_part" })
      .eq("id", payment.order_id)
      .in("status", ["quoted"]);
  }

  return NextResponse.json({ ok: true });
}
