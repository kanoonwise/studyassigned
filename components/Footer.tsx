import Link from "next/link";
import { FOOTER_NAV } from "@/content/nav";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:text-zinc-400">
        <p>
          &copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME ?? "StudyAssigned"}.
          Informational only. Your institution&apos;s own rules and official notices apply.
        </p>
        <nav aria-label="Footer" className="flex gap-4">
          {FOOTER_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-zinc-950 dark:hover:text-zinc-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
