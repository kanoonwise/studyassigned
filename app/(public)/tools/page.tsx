import Link from "next/link";
import type { Metadata } from "next";
import {
  Percent,
  CalendarClock,
  Calculator,
  CalendarRange,
  FileSignature,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { toolsIndex } from "@/content/tools";

export const metadata: Metadata = {
  title: "Free Tools",
  description: "Free calculators and generators for similarity reports, deadlines and pricing.",
};

const TOOL_ICONS: Record<string, typeof Percent> = {
  "/tools/ugc-level": Percent,
  "/tools/resubmission": CalendarClock,
  "/tools/quote": Calculator,
  "/tools/timeline": CalendarRange,
  "/tools/disclosure": FileSignature,
  "/tools/appeal-kit": ShieldAlert,
};

export default function ToolsIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Free tools</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Informational only. Your institution&apos;s own rules and official notices apply.
      </p>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2">
        {toolsIndex.map((tool) => {
          const Icon = TOOL_ICONS[tool.href] ?? Calculator;
          return (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="group flex h-full flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="bg-primary-soft text-primary flex h-11 w-11 items-center justify-center rounded-xl">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="group-hover:text-primary font-medium">{tool.title}</span>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{tool.body}</p>
                <span className="text-primary mt-auto inline-flex items-center gap-1 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">
                  Open tool
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
