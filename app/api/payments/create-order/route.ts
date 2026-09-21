import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { razorpayClient, toPaise } from "@/lib/payments/razorpay";

const MILESTONE_SHARE = { deposit: 0.3, final: 0.7 } as const;

const schema = z.object({
  orderId: z.string().uuid(),
  milestone: z.enum(["deposit", "final"]),
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { orderId, milestone } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  // RLS (orders_student_select) already confines this to the caller's own order.
  const { data: order } = await supabase
    .from("orders")
    .select("id, quote, status, student_id")
    .eq("id", orderId)
    .single();
  if (!order || order.student_id !== user.id) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (!order.quote) {
    return NextResponse.json({ error: "This order doesn't have a quote yet." }, { status: 400 });
  }

  const amount = toPaise(order.quote * MILESTONE_SHARE[milestone]);

  let razorpayOrder;
  try {
    razorpayOrder = await razorpayClient().orders.create({
      amount,
      currency: "INR",
      receipt: `${orderId}-${milestone}`,
      notes: { orderId, milestone },
    });
  } catch {
    return NextResponse.json({ error: "Could not start payment." }, { status: 500 });
  }

  const { error } = await supabase.from("payments").insert({
    order_id: orderId,
    razorpay_order_id: razorpayOrder.id,
    amount: amount / 100,
    status: "created",
    milestone,
  });
  if (error) {
    return NextResponse.json({ error: "Could not record payment." }, { status: 500 });
  }

  return NextResponse.json({
    razorpayOrderId: razorpayOrder.id,
    amount,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
}
