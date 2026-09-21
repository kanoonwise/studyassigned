import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { institutionsToCsv } from "@/lib/import/build-workbook";
import type { DeadlineStatus } from "@/lib/supabase/types";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = request.nextUrl;

  let query = supabase.from("institutions").select("*").order("aishe_code");
  const state = searchParams.get("state");
  const status = searchParams.get("status");
  if (state) query = query.eq("state", state);
  if (status) query = query.eq("status", status as DeadlineStatus);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }

  const csv = institutionsToCsv(data ?? []);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="institutions-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
