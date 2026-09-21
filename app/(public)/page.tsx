import Link from "next/link";
import type { Metadata } from "next";
import {
  FileSearch,
  CalendarClock,
  PenLine,
  ArrowRight,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { home } from "@/content/home";
import { toolsIndex } from "@/content/tools";

export const metadata: Metadata = {
  title: "Report explanation, deadlines and editing support",
  description: home.hero.subtitle,
};

const PILLAR_ICONS: LucideIcon[] = [FileSearch, CalendarClock, PenLine];

export default function Home() {
  return (
    <div>
      <div className="hero-glow border-b border-zinc-200/70 dark:border-zinc-800/70">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <section className="flex flex-col items-center gap-6 text-center">
            <span className="bg-primary-soft text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              Built for students and researchers across India
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              {home.hero.title}
            </h1>
            <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              {home.hero.subtitle}
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={home.hero.primaryCta.href}
                className="bg-primary text-primary-foreground shadow-primary/25 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium shadow-lg transition-transform hover:scale-[1.03]"
              >
                {home.hero.primaryCta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={home.hero.secondaryCta.href}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white/60 px-6 py-3 text-sm font-medium backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/60"
              >
                {home.hero.secondaryCta.label}
              </Link>
            </div>
          </section>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <section className="grid gap-6 sm:grid-cols-3">
          {home.pillars.map((pillar, index) => {
            const Icon = PILLAR_ICONS[index] ?? Sparkles;
            return (
              <div
                key={pillar.title}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="bg-primary-soft text-primary flex h-11 w-11 items-center justify-center rounded-xl">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <h2 className="text-lg font-semibold">{pillar.title}</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{pillar.body}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-20 rounded-3xl border border-zinc-200 bg-zinc-50 p-8 sm:p-10 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Free tools, no account needed
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Calculators and generators built from your institution&apos;s own rules.
              </p>
            </div>
            <Link
              href="/tools"
              className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              See all tools
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {toolsIndex.slice(0, 6).map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group hover:border-primary/40 flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-4 transition-colors dark:border-zinc-800 dark:bg-zinc-950"
              >
                <span className="group-hover:text-primary text-sm font-medium">{tool.title}</span>
                <span className="text-xs text-zinc-500">{tool.body}</span>
              </Link>
            ))}
          </div>
        </section>

        <p className="mt-16 text-center text-sm text-zinc-500">{home.disclosure}</p>
      </div>
    </div>
  );
}
