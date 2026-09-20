import Link from "next/link";
import type { Metadata } from "next";
import { toolsIndex } from "@/content/tools";

export const metadata: Metadata = {
  title: "Free Tools",
  description: "Free calculators and generators for similarity reports, deadlines and pricing.",
};

export default function ToolsIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Free tools</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Informational only. Your institution&apos;s own rules and official notices apply.
      </p>
      <ul className="mt-10 flex flex-col gap-6">
        {toolsIndex.map((tool) => (
          <li key={tool.href}>
            <Link href={tool.href} className="font-medium underline-offset-4 hover:underline">
              {tool.title}
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{tool.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
