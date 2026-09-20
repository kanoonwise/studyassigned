import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, clientIpFrom } from "@/lib/rate-limit";

const TOOLS = [
  "ugc-level",
  "resubmission",
  "quote",
  "timeline",
  "disclosure",
  "appeal-letter",
] as const;

const logSchema = z.object({
  tool: z.enum(TOOLS),
  inputs: z.record(z.string(), z.unknown()),
  email: z.string().trim().email().optional(),
  consent: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const ip = clientIpFrom(request.headers);
  const limit = rateLimit(`tool-log:${ip}`, { limit: 30, windowMs: 10 * 60 * 1000 });
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const parsed = logSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }
  const { tool, inputs, email, consent } = parsed.data;

  const supabase = await createClient();
  let leadId: string | null = null;

  if (email && consent) {
    // Anonymous inserts have no SELECT policy on leads, and RETURNING (what
    // .select() would add here) needs one - so the id is generated up
    // front instead of read back after the insert.
    leadId = randomUUID();
    const { error: leadError } = await supabase.from("leads").insert({
      id: leadId,
      email,
      service: tool,
      source: `tool:${tool}`,
      consent_at: new Date().toISOString(),
      message: `Requested their ${tool} result by email.`,
    });
    if (leadError) {
      return NextResponse.json({ error: "Could not save your request." }, { status: 500 });
    }
  }

  await supabase.from("tool_events").insert({ tool, inputs, lead_id: leadId });

  return NextResponse.json({ ok: true });
}
