import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildVaultTimeline, buildAuthorshipReportLines } from "@/lib/vault";
import { renderTextPdf } from "@/lib/pdf";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: project } = await supabase
    .from("vault_projects")
    .select("id, title, owner")
    .eq("id", id)
    .single();
  if (!project || project.owner !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { data: documents } = await supabase
    .from("documents")
    .select("id, path, sha256, uploaded_at, version_label")
    .eq("vault_project_id", id)
    .order("uploaded_at", { ascending: true });

  const timeline = buildVaultTimeline(documents ?? []);
  const lines = buildAuthorshipReportLines(project.title, user.email ?? "Student", timeline);
  const pdfBytes = await renderTextPdf(lines);

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="authorship-evidence-${project.id.slice(0, 8)}.pdf"`,
    },
  });
}
