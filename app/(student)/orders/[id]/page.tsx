import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RazorpayCheckoutButton } from "@/components/RazorpayCheckoutButton";
import { ReviewForm } from "./ReviewForm";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: events }, { data: review }, { data: payments }] =
    await Promise.all([
      supabase.from("orders").select("*").eq("id", id).single(),
      supabase.from("order_events").select("event, at").eq("order_id", id).order("at"),
      supabase.from("reviews").select("id").eq("order_id", id).maybeSingle(),
      supabase.from("payments").select("status").eq("order_id", id).eq("status", "captured"),
    ]);

  if (!order) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">{order.service ?? "Order"}</h1>
        <p className="text-sm text-zinc-500">
          Status: {order.status} {order.quote ? `· Quote: ₹${order.quote}` : ""}
        </p>
      </div>

      {order.status === "quoted" ? (
        <RazorpayCheckoutButton orderId={order.id} milestone="deposit" label="Pay deposit (30%)" />
      ) : null}
      {order.status === "in_progress" ? (
        <RazorpayCheckoutButton
          orderId={order.id}
          milestone="final"
          label="Pay remaining balance"
        />
      ) : null}

      {payments && payments.length > 0 ? (
        <a
          href={`/api/orders/${order.id}/invoice`}
          className="self-start rounded-full border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
        >
          Download receipt (PDF)
        </a>
      ) : null}

      <div>
        <h2 className="text-lg font-semibold">Timeline</h2>
        <ul className="mt-2 flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          {events?.map((event, i) => (
            <li key={i}>
              {new Date(event.at).toLocaleString()}: {event.event}
            </li>
          ))}
        </ul>
      </div>

      {order.status === "delivered" && !review ? (
        <div>
          <h2 className="text-lg font-semibold">Leave a review</h2>
          <div className="mt-2">
            <ReviewForm orderId={order.id} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
