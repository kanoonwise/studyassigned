import type { MetadataRoute } from "next";

const STATIC_PATHS = [
  "",
  "/services",
  "/how-it-works",
  "/integrity",
  "/faq",
  "/contact",
  "/terms",
  "/privacy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://studyassigned.example";
  return STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
}
