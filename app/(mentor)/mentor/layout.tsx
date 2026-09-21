import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MentorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/mentor");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || (profile.role !== "mentor" && profile.role !== "admin")) {
    redirect("/");
  }

  return <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">{children}</div>;
}
