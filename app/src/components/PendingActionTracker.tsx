'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { AlarmClock, CheckCircle2, ClipboardCopy, Plus, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'avance.pendingActionTracker.v1';

export interface PendingActionReminder {
  id: string;
  ticketId: string;
  actionRequiredText: string;
  followUpDue: number;
  status: 'waiting-client' | 'waiting-vendor' | 'waiting-internal' | 'ready';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  nextNudgeText: string;
  createdAt: number;
}

const statusLabels: Record<PendingActionReminder['status'], string> = {
  'waiting-client': 'Waiting client',
  'waiting-vendor': 'Waiting vendor',
  'waiting-internal': 'Waiting internal',
  ready: 'Ready',
};

const priorityLabels: Record<PendingActionReminder['priority'], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

const defaultNudgeText = 'Hi, just following up on this ticket. Could you please confirm the next available time or provide the requested update?';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function defaultFollowUpDue() {
  return Date.now() + 24 * 60 * 60 * 1000;
}

function toDateTimeInputValue(timestamp: number) {
  const date = new Date(timestamp);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return offsetDate.toISOString().slice(0, 16);
}

function fromDateTimeInputValue(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? defaultFollowUpDue() : parsed.getTime();
}

function readStoredReminders(): PendingActionReminder[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as PendingActionReminder[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => (
      typeof item.id === 'string'
      && typeof item.ticketId === 'string'
      && typeof item.actionRequiredText === 'string'
      && typeof item.followUpDue === 'number'
    )).map((item) => ({
      ...item,
      status: item.status ?? 'waiting-client',
      priority: item.priority ?? 'medium',
      nextNudgeText: item.nextNudgeText ?? defaultNudgeText,
    }));
  } catch {
    return [];
  }
}

function writeStoredReminders(reminders: PendingActionReminder[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

export function PendingActionTracker() {
  const [reminders, setReminders] = useState<PendingActionReminder[]>([]);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [actionRequiredText, setActionRequiredText] = useState('');
  const [followUpDue, setFollowUpDue] = useState(() => toDateTimeInputValue(defaultFollowUpDue()));
  const [status, setStatus] = useState<PendingActionReminder['status']>('waiting-client');
  const [priority, setPriority] = useState<PendingActionReminder['priority']>('medium');
  const [nextNudgeText, setNextNudgeText] = useState(defaultNudgeText);
  const [copyMessage, setCopyMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setReminders(readStoredReminders());
      setHasLoadedStorage(true);
      setCurrentTime(Date.now());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    writeStoredReminders(reminders);
  }, [hasLoadedStorage, reminders]);

  const { overdueReminders, upcomingReminders } = useMemo(() => {
    const sorted = [...reminders].sort((a, b) => a.followUpDue - b.followUpDue);

    return {
      overdueReminders: sorted.filter((item) => currentTime > 0 && item.followUpDue <= currentTime),
      upcomingReminders: sorted.filter((item) => currentTime === 0 || item.followUpDue > currentTime),
    };
  }, [currentTime, reminders]);

  const resetForm = () => {
    setTicketId('');
    setActionRequiredText('');
    setFollowUpDue(toDateTimeInputValue(defaultFollowUpDue()));
    setStatus('waiting-client');
    setPriority('medium');
    setNextNudgeText(defaultNudgeText);
    setError('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const cleanTicketId = ticketId.trim();
    const cleanActionRequiredText = actionRequiredText.trim();

    if (!cleanTicketId) {
      setError('Ticket ID is required');
      return;
    }

    if (!cleanActionRequiredText) {
      setError('Action description is required');
      return;
    }

    const reminder: PendingActionReminder = {
      id: createId(),
      ticketId: cleanTicketId,
      actionRequiredText: cleanActionRequiredText,
      followUpDue: fromDateTimeInputValue(followUpDue),
      status,
      priority,
      nextNudgeText: nextNudgeText.trim() || defaultNudgeText,
      createdAt: Date.now(),
    };

    setReminders((current) => [...current, reminder]);
    resetForm();
    setIsDialogOpen(false);
  };

  const markComplete = (id: string) => {
    setReminders((current) => current.filter((item) => item.id !== id));
  };

  const copyNudge = async (reminder: PendingActionReminder) => {
    await navigator.clipboard.writeText(reminder.nextNudgeText || defaultNudgeText);
    setCopyMessage(`Copied wording for ticket ${reminder.ticketId}`);
    window.setTimeout(() => setCopyMessage(''), 1800);
  };

  const updateReminder = (id: string, changes: Partial<PendingActionReminder>) => {
    setReminders((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  };

  const renderReminder = (reminder: PendingActionReminder, isOverdue: boolean) => (
    <div
      key={reminder.id}
      className={cn(
        'rounded-lg border p-4',
        isOverdue
          ? 'border-cyan-400/60 bg-cyan-400/10 dark:bg-cyan-400/10'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isOverdue ? 'default' : 'outline'} className={isOverdue ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300' : ''}>
              Ticket {reminder.ticketId}
            </Badge>
            <Badge variant="outline">{statusLabels[reminder.status]}</Badge>
            <Badge variant={reminder.priority === 'urgent' || reminder.priority === 'high' ? 'default' : 'outline'}>
              {priorityLabels[reminder.priority]}
            </Badge>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Due {format(new Date(reminder.followUpDue), 'MMM d, h:mm a')}
            </span>
          </div>
          <p className="text-sm leading-6 text-slate-800 dark:text-slate-200">{reminder.actionRequiredText}</p>
          <div className="grid gap-2 md:grid-cols-2">
            <select
              value={reminder.status}
              onChange={(event) => updateReminder(reminder.id, { status: event.target.value as PendingActionReminder['status'] })}
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            >
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select
              value={reminder.priority}
              onChange={(event) => updateReminder(reminder.id, { priority: event.target.value as PendingActionReminder['priority'] })}
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            >
              {Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => copyNudge(reminder)}>
            <ClipboardCopy className="mr-2 h-4 w-4" />
            Copy wording
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => markComplete(reminder.id)}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark Complete
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <section className="mb-6 overflow-hidden rounded-lg border border-slate-800 bg-slate-950 text-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-800 p-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <AlarmClock className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-semibold">Follow-Up Area</h2>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            Track tickets waiting on a client or third party. Store only the ticket ID and a generic action reminder; no client names, email addresses, or PSA data are pulled in.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
              <Plus className="mr-2 h-4 w-4" />
              Add Follow-Up
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add pending action reminder</DialogTitle>
              <DialogDescription>
                Manually enter a ticket ID and the next action. Keep it generic and avoid client-sensitive details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pending-ticket-id">Ticket ID</Label>
                <Input
                  id="pending-ticket-id"
                  value={ticketId}
                  onChange={(event) => setTicketId(event.target.value)}
                  placeholder="0011852"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pending-action-required">Action required</Label>
                <Textarea
                  id="pending-action-required"
                  value={actionRequiredText}
                  onChange={(event) => setActionRequiredText(event.target.value)}
                  placeholder="Client or third party needs to confirm a remote access window."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pending-follow-up-due">Follow-up due</Label>
                <Input
                  id="pending-follow-up-due"
                  type="datetime-local"
                  value={followUpDue}
                  onChange={(event) => setFollowUpDue(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pending-status">Status</Label>
                  <select
                    id="pending-status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value as PendingActionReminder['status'])}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pending-priority">Priority</Label>
                  <select
                    id="pending-priority"
                    value={priority}
                    onChange={(event) => setPriority(event.target.value as PendingActionReminder['priority'])}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pending-nudge">Editable follow-up wording</Label>
                <Textarea
                  id="pending-nudge"
                  value={nextNudgeText}
                  onChange={(event) => setNextNudgeText(event.target.value)}
                  placeholder={defaultNudgeText}
                />
              </div>
              <div className="rounded-md border border-cyan-500/30 bg-cyan-500/10 p-3 text-sm text-slate-700 dark:text-slate-200">
                <div className="flex gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500" />
                  <p>
                    Privacy guardrail: this tracker is local-only and has no HaloPSA integration. Store the ticket ID and workflow reminder only.
                  </p>
                </div>
              </div>
              {error && (
                <p className="text-sm font-medium text-red-500">{error}</p>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save reminder</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4 bg-slate-50 p-6 text-slate-950 dark:bg-slate-900 dark:text-white">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
            {overdueReminders.length} due now
          </Badge>
          <Badge variant="outline">{upcomingReminders.length} scheduled</Badge>
          {copyMessage && <span className="text-sm text-green-600 dark:text-green-400">{copyMessage}</span>}
        </div>

        {overdueReminders.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
              Needs attention
            </h3>
            {overdueReminders.map((reminder) => renderReminder(reminder, true))}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            No due follow-ups right now. Add a reminder when a ticket is waiting on someone else.
          </div>
        )}

        {upcomingReminders.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
              Scheduled follow-ups
            </h3>
            {upcomingReminders.slice(0, 3).map((reminder) => renderReminder(reminder, false))}
          </div>
        )}
      </div>
    </section>
  );
}
