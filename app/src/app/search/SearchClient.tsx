'use client';

import { useEffect, useMemo, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { Search } from 'lucide-react';
import { searchFuse } from '@/lib/searchIndex';

export default function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q')?.trim() ?? '';
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const results = useMemo(() => {
    if (!query) {
      return [];
    }

    return searchFuse.search(query).map((result) => result.item);
  }, [query]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 space-y-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Search the app
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Search pages, tools, learning content, and major app sections from one place.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex w-full max-w-2xl gap-2">
            <label htmlFor="search-query" className="sr-only">
              Search app
            </label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="search-query"
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search app pages, skills, scenarios, KB cards..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-slate-950/20">
          {query ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span>Showing results for</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {query}
                </span>
                <span>{results.length} result{results.length === 1 ? '' : 's'}</span>
              </div>

              {results.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {results.map((result) => (
                    <Link
                      key={result.id}
                      href={result.href}
                      className="block rounded-3xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:border-blue-500 dark:hover:bg-blue-900/70"
                    >
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {result.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {result.description}
                      </p>
                      {result.tags.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {result.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300">
                  No search results found. Try a broader term like <strong>KB</strong>, <strong>health</strong>, or <strong>skills</strong>.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 text-slate-700 dark:text-slate-300">
              <p className="text-sm leading-6">
                Enter a keyword above to search the whole app. You can search page names, tool areas, learning sections, and common topics.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {['KB Learning Machine', 'Health & Outdoors', 'MSP Skills', 'Tool Primers', 'Security Triage'].map((hint) => (
                  <div key={hint} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm dark:border-slate-800 dark:bg-slate-950/70">
                    {hint}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
