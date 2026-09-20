import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <span className="text-sm font-medium tracking-wide text-zinc-500 uppercase">
          Admin · {profile.role}
        </span>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
