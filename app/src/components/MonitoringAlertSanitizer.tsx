'use client';

import { useMemo, useState } from 'react';
import { Clipboard, Eraser, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { PageShell, SectionHeader } from '@/components/academy';
import { sanitizeAlert } from '@/lib/alertSanitizer';

function buildCopyText(result: ReturnType<typeof sanitizeAlert>) {
  return [
    'Sanitized alert:',
    result.sanitizedText.trim() || '[No alert text supplied]',
    '',
    `Likely alert type: ${result.likelyType}`,
    `Priority: ${result.priority}`,
    `System to check first: ${result.firstSystem}`,
    '',
    'Immediate action steps:',
    ...result.immediateSteps.map((step, index) => `${index + 1}. ${step}`),
    '',
    `Escalation condition: ${result.escalationCondition}`,
  ].join('\n');
}

export function MonitoringAlertSanitizer() {
  const [rawText, setRawText] = useState('');
  const result = useMemo(() => sanitizeAlert(rawText), [rawText]);
  const copyText = useMemo(() => buildCopyText(result), [result]);

  const copySanitized = async () => {
    if (typeof navigator === 'undefined') {
      return;
    }

    await navigator.clipboard.writeText(copyText);
  };

  return (
    <PageShell
      eyebrow="Privacy guardrail"
      title="Monitoring Alert Sanitizer"
      subtitle="Tokenize sensitive alert text locally before using it for triage notes or AI-assisted analysis."
    >
      <Card className="border-slate-800 bg-slate-950 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
            Local-only sanitizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="max-w-4xl text-sm leading-6 text-slate-300">
            Paste raw monitoring text here only when you are actively sanitizing it. The text is not saved by this
            app. Review the sanitized output before copying it into a ticket note or any external AI workflow.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SectionHeader title="Raw alert text" description="Do not leave sensitive values here after use" />
              <Button type="button" variant="outline" size="sm" onClick={() => setRawText('')}>
                <Eraser className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              placeholder="Paste an Augmentt, SentinelOne, Veeam, M365, IRONSCALES, or similar monitoring alert here."
              className="min-h-80"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SectionHeader title="Sanitized preview" description="Review before copying anywhere else" />
              <Button type="button" size="sm" onClick={copySanitized}>
                <Clipboard className="mr-2 h-4 w-4" />
                Copy sanitized
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <pre className="min-h-80 overflow-x-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              {result.sanitizedText || 'Sanitized alert text will appear here.'}
            </pre>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{result.tokens.length} sensitive value(s) tokenized</Badge>
              <Badge className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">{result.priority} priority</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <SectionHeader title="Suggested triage output" description="Generated from sanitized text only" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Alert type and first system</p>
              <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                {result.likelyType} · check {result.firstSystem}
              </p>
            </div>
            <ol className="space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
              {result.immediateSteps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-slate-950">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-6 text-amber-900 dark:text-amber-100">
              <p className="font-semibold">Escalation condition</p>
              <p className="mt-1">{result.escalationCondition}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <SectionHeader title="Token map" description="Use to verify sanitization, not for ticket notes" />
          </CardHeader>
          <CardContent>
            {result.tokens.length > 0 ? (
              <div className="space-y-2">
                {result.tokens.map((item) => (
                  <div key={`${item.token}-${item.original}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/60">
                    <p className="font-mono text-xs font-semibold text-cyan-700 dark:text-cyan-300">{item.token}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                No sensitive values detected yet. Still review manually before copying text into any external workflow.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
