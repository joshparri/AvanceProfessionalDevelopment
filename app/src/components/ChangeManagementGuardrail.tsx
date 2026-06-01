'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Clipboard, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { PageShell, SectionHeader } from '@/components/academy';
import { changeGuardrailAreas } from '@/data/changeGuardrails';
import { cn } from '@/lib/utils';

function buildChangeNote(area: (typeof changeGuardrailAreas)[number], checkedItems: string[], summary: string) {
  return [
    `Proposed change: ${area.title}`,
    `Risk level: ${area.risk}`,
    `Scope summary: ${summary.trim() || '[Describe approved scope without client-sensitive values]'}`,
    `Pre-flight checks completed: ${checkedItems.length > 0 ? checkedItems.join('; ') : '[Complete checks before proceeding]'}`,
    `Stop conditions reviewed: ${area.stopIf.join('; ')}`,
    'Approval / owner: [Record approved owner in HaloPSA or approved system]',
    'Rollback plan: [Record rollback or restore step]',
    'Next step: Proceed only if approval, rollback, and impact are clear; otherwise stop and ask a senior tech.',
  ].join('\n');
}

export function ChangeManagementGuardrail() {
  const [selectedAreaId, setSelectedAreaId] = useState(changeGuardrailAreas[0].id);
  const [checkedByArea, setCheckedByArea] = useState<Record<string, string[]>>({});
  const [scopeSummary, setScopeSummary] = useState('');

  const selectedArea = useMemo(
    () => changeGuardrailAreas.find((area) => area.id === selectedAreaId) ?? changeGuardrailAreas[0],
    [selectedAreaId]
  );
  const checkedItems = checkedByArea[selectedArea.id] ?? [];
  const allChecked = checkedItems.length === selectedArea.checks.length;
  const note = buildChangeNote(selectedArea, checkedItems, scopeSummary);

  const toggleCheck = (check: string) => {
    setCheckedByArea((current) => {
      const existing = current[selectedArea.id] ?? [];
      const next = existing.includes(check)
        ? existing.filter((item) => item !== check)
        : [...existing, check];

      return { ...current, [selectedArea.id]: next };
    });
  };

  const copyNote = async () => {
    if (typeof navigator === 'undefined') return;
    await navigator.clipboard.writeText(note);
  };

  const SelectedIcon = selectedArea.icon;

  return (
    <PageShell
      eyebrow="Pre-flight safety"
      title="Change Management Guardrail"
      subtitle="Use this before tenant-wide, server-side, security, identity, endpoint, DNS, or migration changes."
    >
      <Card className="border-slate-800 bg-slate-950 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
            Stop and check before the change
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="max-w-4xl text-sm leading-6 text-slate-300">
            This page does not approve changes. It makes approval, rollback, impact, evidence, and escalation points explicit before work starts.
            Keep client names, hostnames, tenant URLs, credentials, and raw ticket notes in approved systems only.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-3">
          <SectionHeader title="Change area" description="Choose the closest risk category" />
          {changeGuardrailAreas.map((area) => {
            const Icon = area.icon;
            const isSelected = selectedArea.id === area.id;

            return (
              <button
                key={area.id}
                type="button"
                onClick={() => setSelectedAreaId(area.id)}
                className={cn(
                  'w-full rounded-lg border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-400',
                  isSelected
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-slate-200 bg-white hover:border-cyan-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-cyan-700'
                )}
              >
                <div className="flex gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-cyan-500" />
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">{area.title}</p>
                      <Badge variant={area.risk === 'high' ? 'destructive' : 'secondary'}>{area.risk}</Badge>
                    </div>
                    <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">{area.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </aside>

        <main className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <SelectedIcon className="h-5 w-5 text-cyan-500" />
                {selectedArea.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="change-scope-summary" className="text-sm font-semibold text-slate-900 dark:text-white">
                  Generic scope summary
                </label>
                <Textarea
                  id="change-scope-summary"
                  value={scopeSummary}
                  onChange={(event) => setScopeSummary(event.target.value)}
                  placeholder="Example: Update approved phishing reporting policy for one pilot group. Do not enter client names, hostnames, URLs, or credentials."
                />
              </div>

              <section className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">Required checks</h2>
                  <Badge variant={allChecked ? 'default' : 'outline'}>{checkedItems.length}/{selectedArea.checks.length} complete</Badge>
                </div>
                <div className="space-y-2">
                  {selectedArea.checks.map((check) => (
                    <label key={check} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 dark:border-slate-800 dark:bg-slate-900/60">
                      <Checkbox checked={checkedItems.includes(check)} onCheckedChange={() => toggleCheck(check)} className="mt-1" />
                      <span>{check}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-6 text-amber-900 dark:text-amber-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <h2 className="font-semibold">Stop and ask senior tech if</h2>
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {selectedArea.stopIf.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SectionHeader title="Change note scaffold" description="Copy this into the approved system before actioning" />
                <Button type="button" size="sm" onClick={copyNote}>
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
