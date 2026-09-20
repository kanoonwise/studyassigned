import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { rateLimit, clientIpFrom } from "@/lib/rate-limit";
import { screenEnquiry } from "@/lib/intake-screening";
import { sendEnquiryNotification } from "@/lib/email";

const enquirySchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  institutionName: z.string().trim().max(200).optional().or(z.literal("")),
  service: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(4000),
  consent: z.literal(true),
  turnstileToken: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const ip = clientIpFrom(request.headers);
  const limit = rateLimit(`enquiry:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }
  const data = parsed.data;
  if (!data.email && !data.phone) {
    return NextResponse.json({ error: "Provide an email or phone number." }, { status: 400 });
  }

  if (process.env.TURNSTILE_SECRET_KEY) {
    const verified = await verifyTurnstileToken(data.turnstileToken ?? "", ip);
    if (!verified) {
      return NextResponse.json(
        { error: "Verification failed. Please try again." },
        { status: 400 },
      );
    }
  }

  const screening = screenEnquiry(data.message);

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    institution_name: data.institutionName || null,
    service: data.service || null,
    message: data.message,
    source: "enquiry_form",
    consent_at: new Date().toISOString(),
    flagged: screening.flagged,
    flag_reason: screening.reason,
  });

  if (error) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  await sendEnquiryNotification({
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    service: data.service || null,
    message: data.message,
    flagged: screening.flagged,
  }).catch(() => {
    // Email delivery failing shouldn't fail the enquiry - it's already saved.
  });

  return NextResponse.json({ ok: true, flagged: screening.flagged });
}
