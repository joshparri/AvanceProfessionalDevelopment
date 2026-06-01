import { Suspense } from 'react';
import SearchClient from './SearchClient';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-600 dark:text-slate-300">Loading search…</div>}>
      <SearchClient />
    </Suspense>
  );
}
