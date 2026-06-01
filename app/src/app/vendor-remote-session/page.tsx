'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Phone, CalendarDays, ClipboardCopy, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const vendorCategories = [
  'Medical software',
  'POS system',
  'Cloud app',
  'Security vendor',
  'Endpoint vendor',
  'Other',
] as const;

const accessTypes = [
  'Remote desktop access',
  'Screen share',
  'Server access',
  'Vendor portal login',
  'Support session only',
] as const;

export default function VendorRemoteSessionPage() {
  const [category, setCategory] = useState<string>(vendorCategories[0]);
  const [accessType, setAccessType] = useState<string>(accessTypes[0]);
  const [whoPresent, setWhoPresent] = useState('Technician and customer representative');
  const [nextAttempt, setNextAttempt] = useState('24 hours from now');
  const [notes, setNotes] = useState('');

  const summary = useMemo(() => {
    return `Vendor remote session need:\nCategory: ${category}\nRequired access: ${accessType}\nWho should be present: ${whoPresent}\nNext contact attempt: ${nextAttempt}\nNotes: ${notes.trim() || 'None'}\n`;
  }, [category, accessType, whoPresent, nextAttempt, notes]);

  const copySummary = async () => {
    if (!navigator.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(summary);
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <Card className="mb-6 border-slate-800 bg-slate-950 text-white">
          <CardHeader>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Briefcase className="h-6 w-6 text-cyan-400" />
                <CardTitle>Vendor Remote Session Coordinator</CardTitle>
              </div>
              <p className="max-w-3xl text-sm text-slate-300">
                Log remote session requirements for third-party vendors without capturing client-sensitive contact details.
              </p>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 xl:grid-cols-[1fr,360px]">
          <Card className="border-slate-700 bg-slate-950 text-slate-100">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-cyan-400" />
                <CardTitle>Session details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="vendor-category">Vendor category</Label>
                  <select
                    id="vendor-category"
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-900"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    {vendorCategories.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="access-type">Access type</Label>
                  <select
                    id="access-type"
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-900"
                    value={accessType}
                    onChange={(event) => setAccessType(event.target.value)}
                  >
                    {accessTypes.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="who-present">Who should be present</Label>
                <Input
                  id="who-present"
                  className="mt-2"
                  value={whoPresent}
                  onChange={(event) => setWhoPresent(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="next-attempt">Next contact attempt</Label>
                <Input
                  id="next-attempt"
                  className="mt-2"
                  value={nextAttempt}
                  onChange={(event) => setNextAttempt(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="vendor-notes">Generic notes</Label>
                <Textarea
                  id="vendor-notes"
                  className="mt-2 bg-slate-900 text-slate-100"
                  placeholder="Describe the session need without vendor contact details or customer-specific names."
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" onClick={copySummary}>
                  <ClipboardCopy className="mr-2 h-4 w-4" />
                  Copy summary
                </Button>
                <Button size="sm" variant="outline" onClick={() => setNotes('')}>
                  Reset notes
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-slate-700 bg-slate-950 text-slate-100">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-cyan-400" />
                  <CardTitle>Session summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap rounded-2xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-200">{summary}</pre>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-cyan-300" />
                <p className="font-semibold">Privacy guardrail</p>
              </div>
              <p className="mt-2 leading-6 text-slate-300">
                This page captures generic workflow details only. Do not record vendor contact numbers, client names, internal hostnames, or raw ticket notes here.
              </p>
              <div className="mt-4">
                <Button asChild variant="secondary" size="sm">
                  <Link href="/security-alerts">Back to Security Alerts</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
