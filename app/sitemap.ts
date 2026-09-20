import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const STATIC_PATHS = [
  "",
  "/services",
  "/how-it-works",
  "/integrity",
  "/faq",
  "/contact",
  "/terms",
  "/privacy",
  "/tools",
  "/tools/ugc-level",
  "/tools/resubmission",
  "/tools/quote",
  "/tools/timeline",
  "/tools/disclosure",
  "/universities",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://studyassigned.example";
  const staticEntries = STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  // Only verified institution pages are indexable (noindex otherwise), so
  // only they belong in the sitemap - everything else is a thin page.
  const supabase = await createClient();
  const { data: institutions } = await supabase
    .from("public_institutions")
    .select("aishe_code")
    .eq("status", "verified")
    .limit(5000);

  const institutionEntries = (institutions ?? []).map((institution) => ({
    url: `${base}/universities/${institution.aishe_code}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...institutionEntries];
}
