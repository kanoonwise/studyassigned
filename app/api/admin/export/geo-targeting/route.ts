import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geoTargetingToCsv } from "@/lib/import/build-workbook";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("institutions").select("*").order("aishe_code");
  if (error) {
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }

  const csv = geoTargetingToCsv(data ?? []);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="geo-targeting-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
