'use client';

import { useMemo, useState } from 'react';
import { Clipboard, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageShell, SectionHeader } from '@/components/academy';
import {
  securityAlertPaths,
  type SecurityAlertPath,
  type SecurityAlertSeverity,
} from '@/data/securityAlertTriage';
import { cn } from '@/lib/utils';

const severityStyles: Record<SecurityAlertSeverity, string> = {
  high: 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-200',
  medium: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-200',
  low: 'border-slate-400/50 bg-slate-500/10 text-slate-700 dark:text-slate-200',
};

function buildNote(path: SecurityAlertPath) {
  return [
    `Issue reported: ${path.noteHints.issue}`,
    `What I checked: ${path.noteHints.checked}`,
    `What I found: ${path.noteHints.found}`,
    `Action taken: ${path.noteHints.action}`,
    `Outcome: ${path.noteHints.outcome}`,
    `Next step / follow-up needed: ${path.noteHints.nextStep}`,
  ].join('\n');
}

export function SecurityAlertTriage() {
  const [selectedPathId, setSelectedPathId] = useState(securityAlertPaths[0]?.id ?? '');
  const selectedPath = useMemo(
    () => securityAlertPaths.find((path) => path.id === selectedPathId) ?? securityAlertPaths[0],
    [selectedPathId]
  );

  const note = selectedPath ? buildNote(selectedPath) : '';

  const copyNote = async () => {
    if (!note || typeof navigator === 'undefined') {
      return;
    }

    await navigator.clipboard.writeText(note);
  };

  if (!selectedPath) {
    return null;
  }

  const SelectedIcon = selectedPath.icon;

  return (
    <PageShell
      eyebrow="Workflow copilot"
      title="Security Alert Triage"
      subtitle="Classify recurring monitoring alerts, take the first safe checks, and produce a clean HaloPSA note without storing client-sensitive data."
    >
      <Card className="border-slate-800 bg-slate-950 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
            Privacy-first security workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="max-w-4xl text-sm leading-6 text-slate-300">
            Choose the alert type manually. Do not paste raw alerts, client names, user emails, IP addresses,
            tenant names, device names, passwords, or internal URLs into this module. Use the approved security
            consoles and HaloPSA for sensitive evidence.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-3">
          <SectionHeader title="Alert type" description="Pick the closest matching path" />
          <div className="space-y-2">
            {securityAlertPaths.map((path) => {
              const Icon = path.icon;
              const isSelected = path.id === selectedPath.id;

              return (
                <button
                  key={path.id}
                  type="button"
                  onClick={() => setSelectedPathId(path.id)}
                  className={cn(
                    'w-full rounded-lg border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-400',
                    isSelected
                      ? 'border-cyan-500 bg-cyan-500/10 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-cyan-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-cyan-700'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-cyan-500" />
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{path.title}</h2>
                        <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase', severityStyles[path.severity])}>
                          {path.severity}
                        </span>
                      </div>
                      <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">{path.summary}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <SelectedIcon className="h-5 w-5 text-cyan-500" />
                    {selectedPath.title}
                  </CardTitle>
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{selectedPath.summary}</p>
                </div>
                <Badge variant="outline" className="w-fit">
                  First system: {selectedPath.firstSystem}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <section className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
                    First checks
                  </h3>
                  <ol className="space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                    {selectedPath.firstChecks.map((check, index) => (
                      <li key={check} className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-slate-950">
                          {index + 1}
                        </span>
                        <span>{check}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
                    Action steps
                  </h3>
                  <ol className="space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                    {selectedPath.actionSteps.map((step, index) => (
                      <li key={step} className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-slate-950">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>

              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-6 text-amber-900 dark:text-amber-100">
                <p className="font-semibold">Escalation condition</p>
                <p className="mt-1">{selectedPath.escalationCondition}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SectionHeader title="Ticket note scaffold" description="Copy and complete inside HaloPSA" />
                <Button type="button" size="sm" variant="outline" onClick={copyNote}>
                  <Clipboard className="mr-2 h-4 w-4" />
                  Copy note
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                {note}
              </pre>
            </CardContent>
          </Card>
        </main>
      </div>
    </PageShell>
  );
}
