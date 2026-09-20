import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_NAV } from "@/content/admin-nav";

const STAFF_ROLES = new Set(["admin", "verifier", "ops"]);

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !STAFF_ROLES.has(profile.role)) {
    redirect("/");
  }

  const nav = ADMIN_NAV.filter((item) => item.roles.includes(profile.role));

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-zinc-200 px-4 py-4 md:w-56 md:border-r md:border-b-0 md:px-4 md:py-6 dark:border-zinc-800">
        <p className="mb-4 px-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">
          Admin · {profile.role}
        </p>
        <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-2 py-1.5 text-sm whitespace-nowrap hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
