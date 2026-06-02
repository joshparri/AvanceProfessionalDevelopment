'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ClipboardCopy, ShieldAlert } from 'lucide-react';

const patterns = [
  { label: 'User_Email', regex: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
  { label: 'IP_Address', regex: /\b(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}\b/g },
  { label: 'Tenant_Name', regex: /\b(?:tenant|org|company|client|domain)[:=\s]*[A-Za-z0-9_-]{3,}\b/gi },
  { label: 'Internal_URL', regex: /https?:\/\/[\w.-]+(?:\/[\w\-./?%&=]*)?/gi },
  { label: 'Device_Name', regex: /\b[A-Za-z0-9_-]{3,}(?:-[A-Za-z0-9_-]{2,}){1,3}\b/g },
  { label: 'Phone_Number', regex: /\b(?:\+?61|\+?1|\+?44|\+?64)?[\s-]?(?:\d{2,4}[\s-]?){2,4}\d{2,4}\b/g },
];

function sanitizeText(text: string) {
  const placeholders = new Map<string, string>();
  const counts: Record<string, number> = {
    User_Email: 0,
    IP_Address: 0,
    Tenant_Name: 0,
    Internal_URL: 0,
    Device_Name: 0,
    Phone_Number: 0,
  };

  const normalized = patterns.reduce((current, pattern) => {
    return current.replace(pattern.regex, (match) => {
      if (placeholders.has(match)) {
        return placeholders.get(match)!;
      }
      counts[pattern.label] += 1;
      const placeholder = `[${pattern.label}_${counts[pattern.label]}]`;
      placeholders.set(match, placeholder);
      return placeholder;
    });
  }, text);

  const mapEntries = Array.from(placeholders.entries()).map(([value, placeholder]) => ({ value, placeholder }));
  return { normalized, mapEntries };
}

export default function AlertSanitizerPage() {
  const [rawText, setRawText] = useState('');

  const { normalized, mapEntries } = useMemo(() => sanitizeText(rawText), [rawText]);

  const copySanitized = async () => {
    if (!navigator.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(normalized);
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <Card className="mb-6 border-slate-800 bg-slate-950 text-white">
          <CardHeader>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-6 w-6 text-cyan-400" />
                <CardTitle>Monitoring Alert Sanitizer</CardTitle>
              </div>
              <p className="max-w-3xl text-sm text-slate-300">
                Paste raw alert text, then sanitize sensitive values with placeholders before copying a safe summary into HaloPSA or your notes.
              </p>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 xl:grid-cols-[1fr,320px]">
          <div className="space-y-4">
            <Card className="border-slate-700 bg-slate-950 text-slate-100">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <ClipboardCopy className="h-5 w-5 text-cyan-400" />
                  <CardTitle>Paste raw alert text</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  className="min-h-[260px] bg-slate-900 text-slate-100"
                  placeholder="Paste alert details here. The sanitizer will replace email addresses, IPs, URLs, device names, and other sensitive values with placeholders."
                  value={rawText}
                  onChange={(event) => setRawText(event.target.value)}
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button size="sm" onClick={copySanitized}>
                    <ClipboardCopy className="mr-2 h-4 w-4" />
                    Copy sanitized text
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setRawText('')}>
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-950 text-slate-100">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Preview</Badge>
                  <CardTitle>Sanitized output</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[220px] bg-slate-900 text-slate-100"
                  readOnly
                  value={normalized}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-slate-700 bg-slate-950 text-slate-100">
              <CardHeader>
                <CardTitle>Placeholder map</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-300">
                {mapEntries.length > 0 ? (
                  <div className="space-y-2">
                    {mapEntries.map((entry) => (
                      <div key={entry.placeholder} className="rounded-md border border-slate-700 bg-slate-900 p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Placeholder</p>
                        <p className="font-mono text-sm text-cyan-200">{entry.placeholder}</p>
                        <p className="text-sm text-slate-400">Original: {entry.value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No sensitive values detected yet. Paste alert text to see sanitized placeholders.</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-slate-200">
              <p className="font-semibold">Use this before sharing</p>
              <p className="mt-2 leading-6 text-slate-300">
                This helper is intentionally local-only and does not call any external API itself. It helps keep alerts safe by hiding sensitive tenant and device details behind placeholders.
              </p>
              <div className="mt-4">
                <Button asChild variant="secondary" size="sm">
                  <Link href="/security-alerts">Open Security Alert Triage</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
