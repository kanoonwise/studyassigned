import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildExportWorkbook } from "@/lib/import/build-workbook";

export async function GET() {
  const supabase = await createClient();

  const [
    { data: institutions, error: institutionsError },
    { data: authorities, error: authoritiesError },
  ] = await Promise.all([
    supabase.from("institutions").select("*").order("aishe_code"),
    supabase.from("authorities").select("*").order("aishe_code"),
  ]);

  // RLS (staff-only select) does the real access control; a non-staff
  // caller gets empty arrays back here, not an error.
  if (institutionsError || authoritiesError) {
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }

  const workbook = buildExportWorkbook(institutions ?? [], authorities ?? []);
  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="studyassigned-export-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
