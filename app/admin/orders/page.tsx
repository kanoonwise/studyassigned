import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, service, status, quote, due_date, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-xl font-semibold">Orders</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
              <th className="py-2 pr-4">Created</th>
              <th className="py-2 pr-4">Service</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Quote</th>
              <th className="py-2 pr-4">Due</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2 pr-4">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="py-2 pr-4">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {order.service ?? "-"}
                  </Link>
                </td>
                <td className="py-2 pr-4">{order.status}</td>
                <td className="py-2 pr-4">{order.quote ? `₹${order.quote}` : "-"}</td>
                <td className="py-2 pr-4">{order.due_date ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders || orders.length === 0 ? (
          <p className="py-4 text-sm text-zinc-500">No orders yet.</p>
        ) : null}
      </div>
    </div>
  );
}
