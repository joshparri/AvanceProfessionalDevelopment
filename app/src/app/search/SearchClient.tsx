'use client';

import { useEffect, useMemo, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { Search } from 'lucide-react';
import { searchFuse } from '@/lib/searchIndex';
import { db, initDatabase } from '@/lib/db';
import { Task, WorkLog } from '@/types';

type DynamicSearchItem = {
  id: string;
  href: string;
  title: string;
  description: string;
  category: 'task' | 'worklog';
  tags: string[];
};

const buildTaskResult = (task: Task): DynamicSearchItem => ({
  id: `task-${task.id}`,
  href: `/tasks?q=${encodeURIComponent(task.title)}`,
  title: task.title,
  description: task.description || 'Task with follow-up action, priority, and due date.',
  category: 'task',
  tags: [task.category, task.priority, ...task.tags],
});

const buildWorkLogResult = (log: WorkLog): DynamicSearchItem => ({
  id: `worklog-${log.id}`,
  href: `/work-logs?q=${encodeURIComponent(log.description)}`,
  title: log.description,
  description: log.notes || `Work log from ${new Date(log.date).toLocaleDateString()}`,
  category: 'worklog',
  tags: [log.category, ...log.tags],
});

export default function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q')?.trim() ?? '';
  const [searchInput, setSearchInput] = useState(query);
  const [taskResults, setTaskResults] = useState<DynamicSearchItem[]>([]);
  const [workLogResults, setWorkLogResults] = useState<DynamicSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    if (!query) {
      setTaskResults([]);
      setWorkLogResults([]);
      return;
    }

    const loadLocalResults = async () => {
      setIsLoading(true);
      try {
        await initDatabase();
        const lowerQuery = query.toLowerCase();

        const [tasks, workLogs] = await Promise.all([
          db.tasks.toArray(),
          db.workLogs.toArray(),
        ]);

        const taskMatches = tasks
          .filter((task) =>
            task.title.toLowerCase().includes(lowerQuery) ||
            task.description?.toLowerCase().includes(lowerQuery) ||
            task.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
          )
          .slice(0, 5)
          .map(buildTaskResult);

        const workLogMatches = workLogs
          .filter((log) =>
            log.description.toLowerCase().includes(lowerQuery) ||
            log.notes?.toLowerCase().includes(lowerQuery) ||
            log.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
          )
          .slice(0, 5)
          .map(buildWorkLogResult);

        setTaskResults(taskMatches);
        setWorkLogResults(workLogMatches);
      } catch (error) {
        console.error('Failed to search local items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLocalResults();
  }, [query]);

  const pageResults = useMemo(() => {
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
              Search pages, tools, learning content, tasks, and work logs from one place.
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
                placeholder="Search pages, tasks, logs, skills, and KB cards..."
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
                <span>
                  {pageResults.length + taskResults.length + workLogResults.length} result{pageResults.length + taskResults.length + workLogResults.length === 1 ? '' : 's'}
                </span>
              </div>

              {isLoading ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300">
                  Searching your local tasks and work logs...
                </div>
              ) : (
                <div className="space-y-6">
                  {pageResults.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">App pages</h2>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {pageResults.map((result) => (
                          <Link
                            key={result.id}
                            href={result.href}
                            className="block rounded-3xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:border-blue-500 dark:hover:bg-blue-900/70"
                          >
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                              {result.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                              {result.description}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {taskResults.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Tasks</h2>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {taskResults.map((task) => (
                          <Link
                            key={task.id}
                            href={task.href}
                            className="block rounded-3xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:border-blue-500 dark:hover:bg-blue-900/70"
                          >
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                              {task.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                              {task.description}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                              {task.tags.slice(0, 5).map((tag) => (
                                <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {workLogResults.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Work logs</h2>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {workLogResults.map((log) => (
                          <Link
                            key={log.id}
                            href={log.href}
                            className="block rounded-3xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:border-blue-500 dark:hover:bg-blue-900/70"
                          >
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                              {log.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                              {log.description}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                              {log.tags.slice(0, 5).map((tag) => (
                                <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {pageResults.length === 0 && taskResults.length === 0 && workLogResults.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300">
                      No search results found. Try a broader term like <strong>KB</strong>, <strong>health</strong>, or <strong>tasks</strong>.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 text-slate-700 dark:text-slate-300">
              <p className="text-sm leading-6">
                Enter a keyword above to search the whole app. You can search page names, tool areas, tasks, work logs, and knowledge items.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {['KB Learning Machine', 'Health & Outdoors', 'MSP Skills', 'Tasks', 'Work logs'].map((hint) => (
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
