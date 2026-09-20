import Link from "next/link";
import type { Metadata } from "next";
import { home } from "@/content/home";

export const metadata: Metadata = {
  title: "Report explanation, deadlines and editing support",
  description: home.hero.subtitle,
};

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <section className="flex flex-col gap-6 text-center sm:text-left">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{home.hero.title}</h1>
        <p className="max-w-2xl text-lg text-zinc-600 sm:mx-0 dark:text-zinc-400">
          {home.hero.subtitle}
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:justify-start">
          <Link
            href={home.hero.primaryCta.href}
            className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            {home.hero.primaryCta.label}
          </Link>
          <Link
            href={home.hero.secondaryCta.href}
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium dark:border-zinc-700"
          >
            {home.hero.secondaryCta.label}
          </Link>
        </div>
      </section>

      <section className="mt-20 grid gap-8 sm:grid-cols-3">
        {home.pillars.map((pillar) => (
          <div key={pillar.title} className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">{pillar.title}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{pillar.body}</p>
          </div>
        ))}
      </section>

      <p className="mt-16 text-center text-sm text-zinc-500">{home.disclosure}</p>
    </div>
  );
}
