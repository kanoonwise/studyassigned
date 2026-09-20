import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UploadForm } from "./UploadForm";
import { DocumentRow } from "./DocumentRow";
import { NewOrderForm } from "./NewOrderForm";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The (student) layout also checks this, but layout and page data
  // fetching can run concurrently in the App Router - this page must not
  // assume the layout's redirect has already happened by the time it runs.
  if (!user) {
    redirect("/login?next=/account");
  }

  const [{ data: orders }, { data: documents }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, service, status, quote, due_date, created_at")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("documents")
      .select("id, path, uploaded_at, delete_after")
      .eq("owner", user.id)
      .order("uploaded_at", { ascending: false }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold">My account</h1>
        <p className="text-sm text-zinc-500">{user?.email}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold">My orders</h2>
        <ul className="mt-4 flex flex-col divide-y divide-zinc-100 dark:divide-zinc-900">
          {orders?.map((order) => (
            <li key={order.id} className="py-3 text-sm">
              <Link
                href={`/orders/${order.id}`}
                className="font-medium underline-offset-4 hover:underline"
              >
                {order.service ?? "Order"}
              </Link>
              <p className="text-zinc-500">
                {order.status} {order.quote ? `· ₹${order.quote}` : ""}
              </p>
            </li>
          ))}
        </ul>
        {!orders || orders.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No orders yet.</p>
        ) : null}
        <div className="mt-4">
          <NewOrderForm />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">My documents</h2>
        <p className="text-sm text-zinc-500">
          Stored privately. Only you, and staff working on your order, can access these.
        </p>
        <ul className="mt-4">
          {documents?.map((document) => (
            <DocumentRow key={document.id} document={document} />
          ))}
        </ul>
        <div className="mt-4">
          <UploadForm />
        </div>
      </div>
    </div>
  );
}
