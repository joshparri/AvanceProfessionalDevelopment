import { Navigation } from './Navigation';
import { AppFooter } from './AppFooter';
import { AuthGuard } from './AuthGuard';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-slate-50 to-blue-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        <Navigation />
        <main className="flex-1">{children}</main>
        <AppFooter />
      </div>
    </AuthGuard>
  );
}
