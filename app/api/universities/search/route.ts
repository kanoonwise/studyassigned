import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, clientIpFrom } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = clientIpFrom(request.headers);
  const limit = rateLimit(`university-search:${ip}`, { limit: 60, windowMs: 60 * 1000 });
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const raw = request.nextUrl.searchParams.get("q")?.trim();
  if (!raw || raw.length < 2) {
    return NextResponse.json({ results: [] });
  }
  // PostgREST's .or() filter string uses ",()" as syntax - strip them so
  // user input can't break out of the intended name/state/district filter.
  const q = raw.replace(/[,()]/g, "");
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_institutions")
    .select("aishe_code, name, kind, state, district")
    .or(`name.ilike.%${q}%,state.ilike.%${q}%,district.ilike.%${q}%`)
    .order("name")
    .limit(10);

  if (error) {
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }

  return NextResponse.json({ results: data ?? [] });
}
