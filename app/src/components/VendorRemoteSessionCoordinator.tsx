'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { CalendarClock, CheckCircle2, Clipboard, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageShell, SectionHeader } from '@/components/academy';

const STORAGE_KEY = 'avance.vendorRemoteSessions.v1';

type SessionStatus = 'planning' | 'waiting' | 'scheduled' | 'complete';

interface VendorSession {
  id: string;
  ticketId: string;
  vendorCategory: string;
  accessType: string;
  requiredAttendee: string;
  nextAttemptAt: number;
  status: SessionStatus;
  attemptLog: string[];
  createdAt: number;
}

const statusLabels: Record<SessionStatus, string> = {
  planning: 'Planning',
  waiting: 'Waiting',
  scheduled: 'Scheduled',
  complete: 'Complete',
};

const vendorCategories = ['Medical software', 'Line-of-business app', 'ISP / telco', 'Hardware vendor', 'Security vendor', 'Other'];
const accessTypes = ['Workstation remote access', 'Server remote access', 'Vendor portal', 'Phone-only troubleshooting', 'Screen share with user present'];
const attendeeTypes = ['User or practice contact', 'Senior tech', 'Client approver', 'Vendor only', 'Unknown yet'];

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `vendor-session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function defaultNextAttempt() {
  return Date.now() + 4 * 60 * 60 * 1000;
}

function toDateTimeInputValue(timestamp: number) {
  const date = new Date(timestamp);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return offsetDate.toISOString().slice(0, 16);
}

function fromDateTimeInputValue(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? defaultNextAttempt() : parsed.getTime();
}

function readStoredSessions(): VendorSession[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as VendorSession[];

    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item) => (
      typeof item.id === 'string'
      && typeof item.ticketId === 'string'
      && typeof item.vendorCategory === 'string'
      && typeof item.accessType === 'string'
      && typeof item.requiredAttendee === 'string'
      && typeof item.nextAttemptAt === 'number'
      && Array.isArray(item.attemptLog)
    ));
  } catch {
    return [];
  }
}

function writeStoredSessions(sessions: VendorSession[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function buildVendorNote(session: VendorSession) {
  return [
    `Issue reported: Ticket ${session.ticketId} requires third-party vendor coordination.`,
    `What I checked: Confirmed vendor category (${session.vendorCategory}), access type (${session.accessType}), and required attendee (${session.requiredAttendee}).`,
    `What I found: Remote session status is ${statusLabels[session.status]}. Next attempt due ${format(new Date(session.nextAttemptAt), 'MMM d, h:mm a')}.`,
    `Action taken: ${session.attemptLog[0] ?? 'Record call/email attempts and vendor response in HaloPSA.'}`,
    'Outcome: Awaiting vendor/customer availability or completion confirmation.',
    'Next step / follow-up needed: Follow up at the scheduled time and keep sensitive contact details inside approved systems.',
  ].join('\n');
}

export function VendorRemoteSessionCoordinator() {
  const [sessions, setSessions] = useState<VendorSession[]>(() => readStoredSessions());
  const [hasLoadedStorage, setHasLoadedStorage] = useState(true);
  const [ticketId, setTicketId] = useState('');
  const [vendorCategory, setVendorCategory] = useState(vendorCategories[0]);
  const [accessType, setAccessType] = useState(accessTypes[0]);
  const [requiredAttendee, setRequiredAttendee] = useState(attendeeTypes[0]);
  const [nextAttemptAt, setNextAttemptAt] = useState(toDateTimeInputValue(defaultNextAttempt()));
  const [attemptTextById, setAttemptTextById] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (hasLoadedStorage) {
      writeStoredSessions(sessions);
    }
  }, [hasLoadedStorage, sessions]);

  const activeSessions = useMemo(
    () => [...sessions].filter((session) => session.status !== 'complete').sort((a, b) => a.nextAttemptAt - b.nextAttemptAt),
    [sessions]
  );

  const completedSessions = useMemo(
    () => [...sessions].filter((session) => session.status === 'complete').sort((a, b) => b.nextAttemptAt - a.nextAttemptAt).slice(0, 3),
    [sessions]
  );

  const addSession = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const cleanTicketId = ticketId.trim();
    if (!cleanTicketId) {
      setError('Ticket ID is required');
      return;
    }

    setSessions((current) => [
      ...current,
      {
        id: createId(),
        ticketId: cleanTicketId,
        vendorCategory,
        accessType,
        requiredAttendee,
        nextAttemptAt: fromDateTimeInputValue(nextAttemptAt),
        status: 'planning',
        attemptLog: [],
        createdAt: Date.now(),
      },
    ]);

    setTicketId('');
    setNextAttemptAt(toDateTimeInputValue(defaultNextAttempt()));
    setError('');
  };

  const updateSession = (id: string, changes: Partial<VendorSession>) => {
    setSessions((current) => current.map((session) => (session.id === id ? { ...session, ...changes } : session)));
  };

  const addAttempt = (id: string) => {
    const text = attemptTextById[id]?.trim();
    if (!text) return;

    const entry = `${format(new Date(), 'MMM d, h:mm a')} - ${text}`;
    setSessions((current) => current.map((session) => (
      session.id === id ? { ...session, attemptLog: [entry, ...session.attemptLog] } : session
    )));
    setAttemptTextById((current) => ({ ...current, [id]: '' }));
  };

  const removeSession = (id: string) => {
    setSessions((current) => current.filter((session) => session.id !== id));
  };

  const copyNote = async (session: VendorSession) => {
    if (typeof navigator === 'undefined') return;
    await navigator.clipboard.writeText(buildVendorNote(session));
  };

  return (
    <PageShell
      eyebrow="Workflow copilot"
      title="Vendor Remote Session Coordinator"
      subtitle="Track third-party remote sessions without storing client names, vendor contacts, internal URLs, credentials, or raw ticket notes."
    >
      <Card className="border-slate-800 bg-slate-950 text-white">
        <CardHeader>
          <SectionHeader title="Add vendor session" description="Use generic categories and keep sensitive details in HaloPSA" />
        </CardHeader>
        <CardContent>
          <form onSubmit={addSession} className="grid gap-4 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="vendor-ticket">Ticket ID</Label>
              <Input id="vendor-ticket" value={ticketId} onChange={(event) => setTicketId(event.target.value)} placeholder="0012121" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor-category">Vendor category</Label>
              <select
                id="vendor-category"
                value={vendorCategory}
                onChange={(event) => setVendorCategory(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white"
              >
                {vendorCategories.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor-access">Access type</Label>
              <select
                id="vendor-access"
                value={accessType}
                onChange={(event) => setAccessType(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white"
              >
                {accessTypes.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor-attendee">Required attendee</Label>
              <select
                id="vendor-attendee"
                value={requiredAttendee}
                onChange={(event) => setRequiredAttendee(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white"
              >
                {attendeeTypes.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor-next-attempt">Next attempt</Label>
              <div className="flex gap-2">
                <Input id="vendor-next-attempt" type="datetime-local" value={nextAttemptAt} onChange={(event) => setNextAttemptAt(event.target.value)} required />
                <Button type="submit" className="shrink-0">
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>
            {error && (
              <p className="col-span-full text-sm font-medium text-red-400">{error}</p>
            )}
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-4">
          <SectionHeader title="Active coordination" description="Remote sessions waiting on scheduling, access, or completion" />
          {activeSessions.length > 0 ? (
            activeSessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">Ticket {session.ticketId}</Badge>
                        <Badge variant="outline">{statusLabels[session.status]}</Badge>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {format(new Date(session.nextAttemptAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {session.vendorCategory} · {session.accessType} · {session.requiredAttendee}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => copyNote(session)}>
                        <Clipboard className="mr-2 h-4 w-4" />
                        Copy note
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => updateSession(session.id, { status: 'complete' })}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Complete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-[180px_1fr_160px]">
                    <select
                      value={session.status}
                      onChange={(event) => updateSession(session.id, { status: event.target.value as SessionStatus })}
                      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                    >
                      {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <Textarea
                      value={attemptTextById[session.id] ?? ''}
                      onChange={(event) => setAttemptTextById((current) => ({ ...current, [session.id]: event.target.value }))}
                      placeholder="Generic attempt note, e.g. vendor unavailable; emailed support queue; awaiting customer callback window."
                    />
                    <Button type="button" onClick={() => addAttempt(session.id)}>Log attempt</Button>
                  </div>
                  {session.attemptLog.length > 0 && (
                    <div className="space-y-2">
                      {session.attemptLog.map((entry) => (
                        <div key={entry} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/60">
                          {entry}
                        </div>
                      ))}
                    </div>
                  )}
                  <Button type="button" size="sm" variant="ghost" onClick={() => removeSession(session.id)} className="text-slate-500">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove local tracker item
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-slate-600 dark:text-slate-300">
                No active vendor sessions. Add one when a ticket needs a third-party remote access window.
              </CardContent>
            </Card>
          )}
        </section>

        <aside className="space-y-4">
          <SectionHeader title="Completed" description="Recent local completions" />
          {completedSessions.length > 0 ? (
            completedSessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-4 text-sm">
                  <p className="font-semibold">Ticket {session.ticketId}</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">{session.vendorCategory}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-4 text-sm text-slate-600 dark:text-slate-300">No completed local items yet.</CardContent>
            </Card>
          )}
        </aside>
      </div>
    </PageShell>
  );
}
