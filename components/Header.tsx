import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { PRIMARY_NAV } from "@/content/nav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-xl">
            <GraduationCap className="h-5 w-5" strokeWidth={2.25} />
          </span>
          {process.env.NEXT_PUBLIC_SITE_NAME ?? "StudyAssigned"}
        </Link>
        <nav aria-label="Primary" className="hidden gap-6 text-sm font-medium md:flex">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-primary dark:hover:text-primary text-zinc-600 transition-colors dark:text-zinc-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/contact"
          className="bg-primary text-primary-foreground shadow-primary/30 rounded-full px-4 py-2 text-sm font-medium shadow-sm transition-transform hover:scale-[1.03]"
        >
          Get in touch
        </Link>
      </div>
      <nav aria-label="Primary" className="flex gap-4 overflow-x-auto px-4 pb-3 text-sm md:hidden">
        {PRIMARY_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap text-zinc-600 dark:text-zinc-400"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
