import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import Markdown from "react-markdown";

export const metadata: Metadata = { title: "Terms of Service" };

export default async function TermsPage() {
  const markdown = await readFile(path.join(process.cwd(), "content/legal/terms.md"), "utf8");
  return (
    <article className="prose prose-zinc dark:prose-invert mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Markdown>{markdown}</Markdown>
    </article>
  );
}
