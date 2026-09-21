import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  return <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">{children}</div>;
}
