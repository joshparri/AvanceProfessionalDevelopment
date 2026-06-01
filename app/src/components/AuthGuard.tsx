'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth';

const PUBLIC_ROUTES = ['/login', '/signup'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    const isPublic = PUBLIC_ROUTES.some((route) => pathname === route);
    if (!user && !isPublic) {
      router.replace('/login');
    }

    if (user && isPublic) {
      router.replace('/');
    }
  }, [loading, user, pathname, router]);

  if (loading && !PUBLIC_ROUTES.some((route) => pathname === route)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-100">
        <p>Restoring session…</p>
      </div>
    );
  }

  return <>{children}</>;
}
