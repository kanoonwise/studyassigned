import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, clientIpFrom } from "@/lib/rate-limit";

const schema = z.object({
  institutionCode: z.string().trim().min(1),
  contact: z.string().trim().min(3),
  consent: z.literal(true),
});

export async function POST(request: NextRequest) {
  const ip = clientIpFrom(request.headers);
  const limit = rateLimit(`deadline-alert:${ip}`, { limit: 10, windowMs: 10 * 60 * 1000 });
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("deadline_alerts").insert({
    institution_code: parsed.data.institutionCode,
    contact: parsed.data.contact,
    consent_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: "Could not save your request." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
