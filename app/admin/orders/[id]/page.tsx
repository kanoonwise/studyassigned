import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderControls } from "./OrderControls";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: events }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).single(),
    supabase
      .from("order_events")
      .select("event, at")
      .eq("order_id", id)
      .order("at", { ascending: false }),
  ]);

  if (!order) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">{order.service ?? "Order"}</h1>
        <p className="text-sm text-zinc-500">Student: {order.student_id ?? "-"}</p>
      </div>

      <OrderControls order={order} />

      <div>
        <h2 className="text-lg font-semibold">Event log</h2>
        <ul className="mt-2 flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          {events?.map((event, i) => (
            <li key={i}>
              {new Date(event.at).toLocaleString()}: {event.event}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
