"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

interface Result {
  aishe_code: string;
  name: string;
  kind: string;
  state: string;
  district: string | null;
}

export function UniversitySearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) return;

    debounceRef.current = setTimeout(async () => {
      const response = await fetch(`/api/universities/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) return;
      const body = await response.json();
      setResults(body.results ?? []);
      setOpen(true);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleChange(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => setOpen(results.length > 0)}
          placeholder="Search by institution name, state or district"
          className="focus:border-primary focus:ring-primary/20 w-full rounded-full border border-zinc-300 bg-white py-3 pr-4 pl-11 text-sm shadow-sm focus:ring-2 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      {open && results.length > 0 ? (
        <ul className="absolute z-10 mt-2 w-full rounded-2xl border border-zinc-200 bg-white text-sm shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          {results.map((result) => (
            <li key={result.aishe_code}>
              <Link
                href={`/universities/${result.aishe_code}`}
                className="hover:bg-primary-soft block rounded-2xl px-4 py-3"
                onClick={() => setOpen(false)}
              >
                <span className="font-medium">{result.name}</span>
                <span className="ml-2 text-zinc-500">
                  {result.kind} · {result.district ? `${result.district}, ` : ""}
                  {result.state}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
