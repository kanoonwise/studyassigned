import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import Markdown from "react-markdown";

export const metadata: Metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const markdown = await readFile(path.join(process.cwd(), "content/legal/privacy.md"), "utf8");
  return (
    <article className="prose prose-zinc dark:prose-invert mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Markdown>{markdown}</Markdown>
    </article>
  );
}
