'use client';

import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { Search } from 'lucide-react';
import { searchFuse } from '@/lib/searchIndex';
import { db, initDatabase } from '@/lib/db';
import { Client, Invoice, KnowledgeEntry, LearningItem, Playbook, Task, WorkLog } from '@/types';

type DynamicSearchCategory = 'task' | 'worklog' | 'knowledge' | 'playbook' | 'client' | 'learning' | 'invoice';

type DynamicSearchItem = {
  id: string;
  href: string;
  title: string;
  description: string;
  category: DynamicSearchCategory;
  tags: string[];
  score?: number;
  matchReason?: string;
};

const RECENT_SEARCHES_KEY = 'avance_recent_searches_v1';

const dynamicCategoryLabels: Record<DynamicSearchCategory, string> = {
  task: 'Tasks',
  worklog: 'Work logs',
  knowledge: 'Knowledge',
  playbook: 'Playbooks',
  client: 'Clients',
  learning: 'Learning',
  invoice: 'Invoices',
};

const emptySuggestions: Record<DynamicSearchCategory | 'all', string[]> = {
  all: ['backup', 'outlook', 'invoice', 'follow up', 'communication'],
  task: ['urgent', 'overdue', 'follow up', 'pd'],
  worklog: ['support', 'handover', 'printer', 'outlook'],
  knowledge: ['verified', 'troubleshooting', 'procedure', 'backup'],
  playbook: ['security', 'setup', 'maintenance', 'troubleshooting'],
  client: ['accounting', 'dental', 'school', 'motel'],
  learning: ['microsoft 365', 'scenario', 'security', 'networking'],
  invoice: ['draft', 'paid', 'hours', 'cycle'],
};

const getInitialRecentSearches = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_SEARCHES_KEY) ?? '[]') as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string').slice(0, 6);
    }
  } catch {
    // Ignore invalid local search history.
  }

  return [];
};

const buildTaskResult = (task: Task): DynamicSearchItem => ({
  id: `task-${task.id}`,
  href: `/tasks?q=${encodeURIComponent(task.title)}#task-${task.id}`,
  title: task.title,
  description: task.description || 'Task with follow-up action, priority, and due date.',
  category: 'task',
  tags: [task.category, task.priority, task.status, ...task.tags],
});

const buildWorkLogResult = (log: WorkLog): DynamicSearchItem => ({
  id: `worklog-${log.id}`,
  href: `/work-logs?q=${encodeURIComponent(log.description)}#worklog-${log.id}`,
  title: log.description,
  description: log.notes || `Work log from ${new Date(log.date).toLocaleDateString()}`,
  category: 'worklog',
  tags: [log.category, ...log.tags],
});

const buildKnowledgeResult = (entry: KnowledgeEntry): DynamicSearchItem => ({
  id: `knowledge-${entry.id}`,
  href: `/knowledge-base?q=${encodeURIComponent(entry.title)}#knowledge-${entry.id}`,
  title: entry.title,
  description: entry.content.slice(0, 180) || 'Knowledge base entry.',
  category: 'knowledge',
  tags: [entry.category, ...entry.tags],
});

const buildPlaybookResult = (playbook: Playbook): DynamicSearchItem => ({
  id: `playbook-${playbook.id}`,
  href: `/playbooks?q=${encodeURIComponent(playbook.title)}#playbook-${playbook.id}`,
  title: playbook.title,
  description: playbook.description || 'Troubleshooting playbook.',
  category: 'playbook',
  tags: [playbook.category, ...playbook.tags],
});

const buildClientResult = (client: Client): DynamicSearchItem => ({
  id: `client-${client.id}`,
  href: `/clients?q=${encodeURIComponent(client.name)}#client-${client.id}`,
  title: client.name,
  description: client.notes || 'Client reference note.',
  category: 'client',
  tags: ['client'],
});

const buildLearningResult = (item: LearningItem): DynamicSearchItem => ({
  id: `learning-${item.id}`,
  href: `/learning-cockpit?q=${encodeURIComponent(item.title)}`,
  title: item.title,
  description: item.description || 'Learning item.',
  category: 'learning',
  tags: [item.category, item.status, item.priority],
});

const buildInvoiceResult = (invoice: Invoice): DynamicSearchItem => ({
  id: `invoice-${invoice.id}`,
  href: `/time-invoices?q=${encodeURIComponent(invoice.notes || invoice.status)}#invoice-${invoice.id}`,
  title: `Invoice ${invoice.hours}h - $${invoice.total}`,
  description: invoice.notes || `Invoice period ${new Date(invoice.period.start).toLocaleDateString()} to ${new Date(invoice.period.end).toLocaleDateString()}.`,
  category: 'invoice',
  tags: [invoice.status, String(invoice.hours), String(invoice.total)],
});

const rankDynamicItem = (item: DynamicSearchItem, lowerQuery: string): DynamicSearchItem | null => {
  const title = item.title.toLowerCase();
  const description = item.description.toLowerCase();
  const matchingTags = item.tags.filter((tag) => tag.toLowerCase().includes(lowerQuery));

  let score = 0;
  const reasons: string[] = [];

  if (title === lowerQuery) {
    score += 120;
    reasons.push('exact title');
  } else if (title.startsWith(lowerQuery)) {
    score += 90;
    reasons.push('title starts with query');
  } else if (title.includes(lowerQuery)) {
    score += 70;
    reasons.push('title match');
  }

  if (matchingTags.length > 0) {
    score += 45 + matchingTags.length * 5;
    reasons.push(`tag: ${matchingTags.slice(0, 2).join(', ')}`);
  }

  if (description.includes(lowerQuery)) {
    score += 25;
    reasons.push('description match');
  }

  if (score === 0) return null;

  return {
    ...item,
    score,
    matchReason: reasons.join(' | '),
  };
};

const highlightMatch = (text: string, query: string): ReactNode => {
  const trimmed = query.trim();
  if (!trimmed) return text;

  const index = text.toLowerCase().indexOf(trimmed.toLowerCase());
  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-yellow-100 px-1 text-yellow-900 dark:bg-yellow-400/20 dark:text-yellow-100">
        {text.slice(index, index + trimmed.length)}
      </mark>
      {text.slice(index + trimmed.length)}
    </>
  );
};

export default function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q')?.trim() ?? '';
  const [searchInput, setSearchInput] = useState(query);
  const [dynamicResults, setDynamicResults] = useState<DynamicSearchItem[]>([]);
  const [typeFilter, setTypeFilter] = useState<DynamicSearchCategory | 'all'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>(getInitialRecentSearches);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadLocalResults = async () => {
      if (!query) {
        await Promise.resolve();
        if (!cancelled) {
          setDynamicResults([]);
        }
        return;
      }

      setIsLoading(true);
      try {
        await initDatabase();
        const lowerQuery = query.toLowerCase();
        const [tasks, workLogs, knowledgeEntries, playbooks, clients, learningItems, invoices] = await Promise.all([
          db.tasks.toArray(),
          db.workLogs.toArray(),
          db.knowledgeEntries.toArray(),
          db.playbooks.toArray(),
          db.clients.toArray(),
          db.learningItems.toArray(),
          db.invoices.toArray(),
        ]);

        const matches = [
          ...tasks.map(buildTaskResult),
          ...workLogs.map(buildWorkLogResult),
          ...knowledgeEntries.map(buildKnowledgeResult),
          ...playbooks.map(buildPlaybookResult),
          ...clients.map(buildClientResult),
          ...learningItems.map(buildLearningResult),
          ...invoices.map(buildInvoiceResult),
        ]
          .map((item) => rankDynamicItem(item, lowerQuery))
          .filter((item): item is DynamicSearchItem => item !== null)
          .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || a.title.localeCompare(b.title))
          .slice(0, 30);

        if (!cancelled) {
          setDynamicResults(matches);
        }
      } catch (error) {
        console.error('Failed to search local items:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadLocalResults();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const pageResults = useMemo(() => {
    if (!query) return [];
    return searchFuse.search(query).map((result) => result.item);
  }, [query]);

  const filteredDynamicResults = useMemo(
    () => (typeFilter === 'all' ? dynamicResults : dynamicResults.filter((result) => result.category === typeFilter)),
    [dynamicResults, typeFilter]
  );

  const totalResultCount = pageResults.length + filteredDynamicResults.length;
  const suggestionTerms = emptySuggestions[typeFilter];

  const runSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    const nextRecent = [trimmed, ...recentSearches.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
    setRecentSearches(nextRecent);
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(nextRecent));
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runSearch(searchInput);
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
              Search pages, tools, learning content, tasks, work logs, knowledge, playbooks, and client notes from one place.
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
          {recentSearches.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((recent) => (
                <button
                  key={recent}
                  type="button"
                  onClick={() => {
                    setSearchInput(recent);
                    runSearch(recent);
                  }}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300"
                >
                  {recent}
                </button>
              ))}
            </div>
          )}
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
                  {totalResultCount} result{totalResultCount === 1 ? '' : 's'}
                </span>
                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value as DynamicSearchCategory | 'all')}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 sm:ml-auto"
                >
                  <option value="all">All content types</option>
                  {Object.entries(dynamicCategoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {isLoading ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300">
                  Searching your local records...
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
                              {highlightMatch(result.title, query)}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                              {highlightMatch(result.description, query)}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredDynamicResults.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Local records</h2>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {filteredDynamicResults.map((result) => (
                          <Link
                            key={result.id}
                            href={result.href}
                            className="block rounded-3xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:border-blue-500 dark:hover:bg-blue-900/70"
                          >
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
                              {dynamicCategoryLabels[result.category]}
                            </span>
                            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                              {highlightMatch(result.title, query)}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                              {highlightMatch(result.description, query)}
                            </p>
                            {result.matchReason && (
                              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                                Best match: {result.matchReason}
                              </p>
                            )}
                            <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                              {result.tags.slice(0, 5).map((tag) => (
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

                  {pageResults.length === 0 && filteredDynamicResults.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300">
                      <p>No search results found for this content type.</p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {suggestionTerms.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              setSearchInput(suggestion);
                              runSearch(suggestion);
                            }}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                          >
                            Try {suggestion}
                          </button>
                        ))}
                      </div>
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
                  <button
                    key={hint}
                    type="button"
                    onClick={() => {
                      setSearchInput(hint);
                      runSearch(hint);
                    }}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left text-sm transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-950/70 dark:hover:border-blue-500"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
