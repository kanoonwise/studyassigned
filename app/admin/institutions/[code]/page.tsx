import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditInstitutionForm } from "./EditInstitutionForm";

export default async function EditInstitutionPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();

  const [{ data: institution }, { data: profile }] = await Promise.all([
    supabase.from("institutions").select("*").eq("aishe_code", code).single(),
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return { data: null };
      return supabase.from("profiles").select("role").eq("id", user.id).single();
    }),
  ]);

  if (!institution) notFound();

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold">{institution.name}</h1>
      <p className="text-sm text-zinc-500">{institution.aishe_code}</p>
      <EditInstitutionForm institution={institution} canEdit={profile?.role === "admin"} />
    </div>
  );
}
