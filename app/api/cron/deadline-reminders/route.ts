import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDeadlineReminderEmail } from "@/lib/email";
import { isWithinReminderWindow } from "@/lib/tools/deadline-status";

/**
 * Scheduled daily (Vercel Cron -> `vercel.json`, or the Supabase pg_cron
 * equivalent) to email anyone who asked to be reminded before an
 * already-verified deadline. Alerts created on an unverified page are
 * handled separately and immediately when markVerified runs - this only
 * covers alerts made on a page that was already verified when someone
 * subscribed, since those never get the "just verified" email.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://studyassigned.example";

  const { data: alerts } = await supabase
    .from("deadline_alerts")
    .select("id, institution_code, contact")
    .is("notified_at", null);

  let sent = 0;

  for (const alert of alerts ?? []) {
    if (!alert.institution_code) continue;

    const { data: institution } = await supabase
      .from("institutions")
      .select("name, calendar_authority_code")
      .eq("aishe_code", alert.institution_code)
      .maybeSingle();
    if (!institution?.calendar_authority_code) continue;

    const { data: deadlines } = await supabase
      .from("deadlines")
      .select("event_type, exact_date")
      .eq("authority_code", institution.calendar_authority_code)
      .eq("status", "verified")
      .not("exact_date", "is", null)
      .order("exact_date");

    const upcoming = (deadlines ?? []).find(
      (d) => d.exact_date && isWithinReminderWindow(d.exact_date),
    );
    if (!upcoming || !upcoming.exact_date) continue;

    const unsubscribeUrl = `${siteUrl}/api/deadline-alerts/unsubscribe?id=${alert.id}`;
    await sendDeadlineReminderEmail(
      alert.contact,
      institution.name,
      upcoming.event_type,
      upcoming.exact_date,
      unsubscribeUrl,
    );
    await supabase
      .from("deadline_alerts")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", alert.id);
    sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
