'use client';

import Link from 'next/link';
import { useLayoutEffect, useRef, useState, FormEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { Search } from 'lucide-react';
import { navigation } from '@/lib/navigation';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navRef = useRef<HTMLDivElement | null>(null);
  const scrollKey = 'avance-nav-scroll-left';

  useLayoutEffect(() => {
    const savedScrollLeft = sessionStorage.getItem(scrollKey);
    if (navRef.current && savedScrollLeft !== null) {
      navRef.current.scrollLeft = Number(savedScrollLeft);
    }
  }, [pathname]);

  const storeScrollPosition = () => {
    if (navRef.current) {
      sessionStorage.setItem(scrollKey, String(navRef.current.scrollLeft));
    }
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex min-w-0 flex-1">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
                <span className="text-blue-600 dark:text-blue-400">Avance</span> Work Companion
              </h1>
            </div>
            <div
              ref={navRef}
              className="hidden sm:ml-6 sm:flex sm:space-x-1 sm:overflow-x-auto"
              onScroll={storeScrollPosition}
            >
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={storeScrollPosition}
                    className={cn(
                      'inline-flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex sm:items-center sm:ml-4 sm:min-w-[240px]">
              <label htmlFor="global-search" className="sr-only">
                Search the app
              </label>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="global-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search app..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
                />
              </div>
            </form>
          </div>
          <div className="ml-3 flex shrink-0 items-center border-l border-slate-200 pl-3 dark:border-slate-700">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden text-sm text-slate-600 dark:text-slate-300 sm:inline">
                  {user.email}
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Sign out
                </Button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Login
              </Link>
            )}
            <DarkModeToggle showLabel />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="border-t border-slate-200 dark:border-slate-800 sm:hidden">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-xs font-medium text-muted-foreground">Theme</span>
          <DarkModeToggle showLabel />
        </div>
        <div className="space-y-1 pb-3 pt-1">
          <Link
            href="/search"
            className={cn(
              'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
              pathname === '/search'
                ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-300'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:border-gray-600 dark:hover:text-gray-300'
            )}
          >
            <div className="flex items-center">
              <Search className="w-5 h-5 mr-3" />
              Search
            </div>
          </Link>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
                  isActive
                    ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-300'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:border-gray-600 dark:hover:text-gray-300'
                )}
              >
                <div className="flex items-center">
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
