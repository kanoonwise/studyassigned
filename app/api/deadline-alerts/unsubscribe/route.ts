import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * One-click unsubscribe from a deadline reminder. No login required by
 * design (that's the point of "one click"); the id is an unguessable
 * UUID and the only thing this does is stop emailing that address, so the
 * low-friction tradeoff is intentional. Uses the service-role client since
 * there's no user session and no delete policy exists for anon/authenticated
 * on deadline_alerts (staff manage it; this is the one public exception).
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  const supabase = createAdminClient();
  await supabase.from("deadline_alerts").delete().eq("id", id);

  return new NextResponse(
    '<!doctype html><html><body style="font-family: sans-serif; padding: 2rem;">' +
      "<p>You've been unsubscribed. You won't receive any more reminders for this deadline.</p>" +
      "</body></html>",
    { headers: { "Content-Type": "text/html" } },
  );
}
