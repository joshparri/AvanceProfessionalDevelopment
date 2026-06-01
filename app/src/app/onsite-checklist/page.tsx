'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/Layout';
import { HeroPanel, PageShell, SectionHeader } from '@/components/academy';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClipboardCheck, ShieldCheck, CalendarDays } from 'lucide-react';

const STORAGE_KEY = 'avance.onsiteChecklist.v1';

type ChecklistPhase = 'pre' | 'onsite' | 'after';

type ChecklistItem = {
  id: string;
  phase: ChecklistPhase;
  title: string;
  description: string;
};

const checklistItems: ChecklistItem[] = [
  {
    id: 'confirm-remote-access-path',
    phase: 'pre',
    title: 'Confirm the expected remote access path',
    description: 'Verify the user is using VPN / RD Gateway / RemoteApp feed / approved access tool before the visit starts.',
  },
  {
    id: 'verify-remoteapp-shortcut',
    phase: 'pre',
    title: 'Verify the correct RemoteApp or RDP shortcut',
    description: 'Ask if multiple old connection shortcuts exist and confirm the current one is in use.',
  },
  {
    id: 'confirm-session-window',
    phase: 'pre',
    title: 'Confirm remote access window with client/vendor',
    description: 'Ensure the remote session time is agreed and the third party is available if needed.',
  },
  {
    id: 'capture-scope-and-risk',
    phase: 'onsite',
    title: 'Confirm scope, impact and safety checks',
    description: 'Note what is being changed, whether backups are ready, and whether any sensitive systems are involved.',
  },
  {
    id: 'confirm-vendor-coordination',
    phase: 'onsite',
    title: 'Confirm vendor or third-party coordination',
    description: 'Check that the vendor remote session or access credentials are working before making changes.',
  },
  {
    id: 'validate-certificate-or-connection',
    phase: 'onsite',
    title: 'Validate certificate, RemoteApp feed, and session connection',
    description: 'For RDP/RemoteApps, confirm the certificate chain and the current access path are correct.',
  },
  {
    id: 'record-observations',
    phase: 'onsite',
    title: 'Record the checks performed and what was found',
    description: 'Keep the note brief and structured: issue, checks, finding, action taken, outcome.',
  },
  {
    id: 'schedule-follow-up-if-needed',
    phase: 'after',
    title: 'Schedule follow-up when client/vendor action remains',
    description: 'If the ticket is still pending a third-party step, create a follow-up reminder before closing the visit.',
  },
  {
    id: 'confirm-client-can-reconnect',
    phase: 'after',
    title: 'Confirm the user can reconnect and test access',
    description: 'Ask the user to reopen the connection or RemoteApp after the change to verify success.',
  },
  {
    id: 'finalise-ticket-note',
    phase: 'after',
    title: 'Finalise the ticket note with next step and handover context',
    description: 'Write the next step clearly so the follow-up is ready for the next technician or client.',
  },
];

function loadChecklistState() {
  if (typeof window === 'undefined') {
    return { checkedIds: [] as string[], summaryNotes: '' };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { checkedIds: [] as string[], summaryNotes: '' };
    }

    const parsed = JSON.parse(raw) as { checkedIds?: string[]; summaryNotes?: string };
    return {
      checkedIds: Array.isArray(parsed.checkedIds) ? parsed.checkedIds.filter((item) => typeof item === 'string') : [],
      summaryNotes: typeof parsed.summaryNotes === 'string' ? parsed.summaryNotes : '',
    };
  } catch {
    return { checkedIds: [] as string[], summaryNotes: '' };
  }
}

function saveChecklistState(state: { checkedIds: string[]; summaryNotes: string }) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function OnsiteChecklistPage() {
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    const state = loadChecklistState();
    return state.checkedIds;
  });
  const [summaryNotes, setSummaryNotes] = useState(() => {
    const state = loadChecklistState();
    return state.summaryNotes;
  });
  const [copyMessage, setCopyMessage] = useState('');

  useEffect(() => {
    saveChecklistState({ checkedIds, summaryNotes });
  }, [checkedIds, summaryNotes]);

  const sections = useMemo(() => {
    return {
      pre: checklistItems.filter((item) => item.phase === 'pre'),
      onsite: checklistItems.filter((item) => item.phase === 'onsite'),
      after: checklistItems.filter((item) => item.phase === 'after'),
    };
  }, []);

  const completedCount = checkedIds.length;
  const totalCount = checklistItems.length;

  const generatedFollowUpNote = useMemo(() => {
    const completedItems = checklistItems.filter((item) => checkedIds.includes(item.id));
    const outstandingItems = checklistItems.filter((item) => !checkedIds.includes(item.id));
    const lines = [
      '## Onsite Checklist Summary',
      `- Completed checks: ${completedItems.length} of ${totalCount}`,
    ];

    if (completedItems.length > 0) {
      lines.push('- Completed actions:');
      completedItems.forEach((item) => {
        lines.push(`  - ${item.title}`);
      });
    }

    if (outstandingItems.length > 0) {
      lines.push('- Remaining actions:');
      outstandingItems.forEach((item) => {
        lines.push(`  - ${item.title}`);
      });
    }

    if (summaryNotes.trim()) {
      lines.push('', '### Notes', summaryNotes.trim());
    }

    lines.push('', '### Next Step', 'Keep this note in the ticket and use it to update the follow-up reminder or handover instructions.');
    return lines.join('\n');
  }, [checkedIds, summaryNotes, totalCount]);

  const handleToggle = (id: string) => {
    setCheckedIds((items) =>
      items.includes(id) ? items.filter((current) => current !== id) : [...items, id]
    );
  };

  const handleCopyNote = async () => {
    try {
      await navigator.clipboard.writeText(generatedFollowUpNote);
      setCopyMessage('Note copied!');
      window.setTimeout(() => setCopyMessage(''), 2000);
    } catch {
      setCopyMessage('Could not copy.');
      window.setTimeout(() => setCopyMessage(''), 2000);
    }
  };

  return (
    <Layout>
      <PageShell
        eyebrow="Work Companion"
        title="Onsite Checklist"
        subtitle="A structured visit workflow with follow-up scheduling and safe ticket-note output."
      >
        <HeroPanel
          title="Keep visits efficient and follow-ups tracked"
          subtitle="Use this local-only checklist to capture the key remote access and handover checks without storing sensitive client data."
          illustration={<CalendarDays className="h-16 w-16 text-cyan-400" />}
        />

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Use the note template generator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              When the checklist is complete, use the ticket notes trainer to turn this summary into a structured note with issue, checks, action, result, and next step.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="sm" asChild>
                <Link href="/ticket-notes">Open Note Template Generator</Link>
              </Button>
              <Button size="sm" variant="outline">
                Set 3CX to Away before leaving (manual reminder)
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {(['pre', 'onsite', 'after'] as ChecklistPhase[]).map((phase) => (
              <Card key={phase} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg capitalize">{phase === 'pre' ? 'Pre-visit' : phase === 'onsite' ? 'Onsite' : 'After visit'}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {phase === 'pre'
                          ? 'Prepare the session and confirm the remote access path.'
                          : phase === 'onsite'
                          ? 'Capture what was checked during the remote support session.'
                          : 'Close the loop with a follow-up reminder and ticket note.'}
                      </p>
                    </div>
                    <Badge variant="secondary">{sections[phase].length} checks</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sections[phase].map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                      <label className="flex items-start gap-3">
                        <Checkbox
                          checked={checkedIds.includes(item.id)}
                          onCheckedChange={() => handleToggle(item.id)}
                          aria-label={item.title}
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{item.title}</span>
                            <Badge variant="outline" className="text-xs uppercase tracking-wide">
                              {phase}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}

            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Notes for the ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="onsite-summary-notes">Summary notes</Label>
                  <Textarea
                    id="onsite-summary-notes"
                    value={summaryNotes}
                    onChange={(event) => setSummaryNotes(event.target.value)}
                    placeholder="Write a concise summary of what was checked, what was done, and the next step."
                    rows={6}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Save a clear next step for the ticket note: what was checked, what was found, action taken, outcome, and follow-up due.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Checklist progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-muted-foreground">Completed tasks</p>
                  <p className="mt-2 text-3xl font-semibold">{completedCount} / {totalCount}</p>
                </div>
                <Button onClick={() => setCheckedIds([])} variant="outline" className="w-full">
                  Reset checklist
                </Button>
                <Button onClick={() => setSummaryNotes('')} variant="outline" className="w-full">
                  Clear notes
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-cyan-500" />
                  Quick export note
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea readOnly value={generatedFollowUpNote} className="min-h-[260px] font-mono text-sm" />
                <div className="flex items-center gap-2">
                  <Button onClick={handleCopyNote} size="sm">
                    Copy follow-up note
                  </Button>
                  {copyMessage && <span className="text-sm text-emerald-600">{copyMessage}</span>}
                </div>
                <p className="text-sm text-muted-foreground">
                  Use this note text in the ticket or handover. It is generated from the checklist state and your summary notes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageShell>
    </Layout>
  );
}
