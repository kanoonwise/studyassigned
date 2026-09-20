import Link from "next/link";
import { PRIMARY_NAV } from "@/content/nav";

export function Header() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {process.env.NEXT_PUBLIC_SITE_NAME ?? "StudyAssigned"}
        </Link>
        <nav aria-label="Primary" className="hidden gap-6 text-sm md:flex">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/contact"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
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
