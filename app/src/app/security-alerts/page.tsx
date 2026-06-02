'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ShieldCheck, Clipboard, ClipboardCopy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const alertCategories = [
  {
    id: 'anomalous-sign-in',
    title: 'Anomalous sign-in',
    summary: 'Unusual sign-in activity detected from an unexpected location or device.',
    checks: [
      'Confirm whether the sign-in was user-initiated or expected.',
      'Check MFA status, recent sign-in history, and conditional access blocks in M365 Admin.',
      'Look for multiple failed sign-in attempts before the success event.',
      'Escalate if the account shows evidence of compromise or if MFA changes occurred without approval.',
    ],
    escalation: 'Escalate to security team if there is account compromise, lateral access risk, or suspicious MFA reset behavior.',
  },
  {
    id: 'mfa-or-security-change',
    title: 'MFA / security-info change',
    summary: 'A change was made to authentication methods, security contact details, or MFA settings.',
    checks: [
      'Confirm the change with the user via a separate trusted channel.',
      'Review recent audit logs for MFA enrollment, phone number, or security info modifications.',
      'Check whether the account was recently accessed from an unknown device or location.',
      'If unverified, treat this as a potential account takeover and lock the account pending review.',
    ],
    escalation: 'Escalate when security-info changes are unexpected, or the account cannot be validated by the user.',
  },
  {
    id: 'account-enablement',
    title: 'Account enablement',
    summary: 'An account was enabled or restored in a system and requires verification.',
    checks: [
      'Confirm whether the account enablement is part of an approved onboarding or recovery workflow.',
      'Check whether the account has the correct group memberships and MFA enforcement.',
      'Verify there are no open incidents related to the same account.',
      'Log the approval path and who requested the enablement.',
    ],
    escalation: 'Escalate if enablement is unexpected, lacks approvals, or the account is highly privileged.',
  },
  {
    id: 'app-consent',
    title: 'App consent',
    summary: 'A third-party application or AI tool granted permissions to access tenant or user data.',
    checks: [
      'Confirm whether the app consent was expected and approved by the business.',
      'Review the permission scope and whether it is broader than required.',
      'Check whether the consent was granted by an admin or a regular user.',
      'If unsure, revoke or block the app until the vendor and security owner agree on scope.',
    ],
    escalation: 'Escalate if the permission scope is high-risk, tenant-wide, or unclear.',
  },
  {
    id: 'endpoint-alert',
    title: 'Endpoint alert',
    summary: 'A security product reported a suspicious endpoint event, such as malware, agent failure, or behavioral anomaly.',
    checks: [
      'Identify which endpoint product reported the alert and whether it is a true or false positive.',
      'Check device health, recent scans, and agent connectivity.',
      'Look for related alerts in SentinelOne, Veeam, or other protection consoles.',
      'Contain the device if threat evidence is strong and coordinate with senior security support.',
    ],
    escalation: 'Escalate for any confirmed compromise, persistent threat, or if the alert cannot be safely contained locally.',
  },
  {
    id: 'backup-failure',
    title: 'Backup failure',
    summary: 'A backup or restore job failed, potentially affecting recovery SLAs.',
    checks: [
      'Confirm which backup job failed and whether it is part of the normal backup window.',
      'Check the backup policy, target storage, and retention settings.',
      'Look for disk, network, or agent issues that caused the failure.',
      'If the issue is unresolved, escalate to the backup owner or vendor support.',
    ],
    escalation: 'Escalate when backups remain failed after retry, or there is a missed restore point objective.',
  },
  {
    id: 'phishing-training',
    title: 'Phishing / security training event',
    summary: 'A user report or training event indicates a suspected phishing message or risk awareness action.',
    checks: [
      'Identify whether the email was a phishing attempt, training simulation, or benign notification.',
      'Avoid clicking unsafe links; capture headers or known suspicious elements instead.',
      'If the email is phishing, confirm whether credentials were submitted or attachments opened.',
      'Advise the user on next steps and escalate if there is evidence of a real compromise.',
    ],
    escalation: 'Escalate if there is credential compromise, lateral access, or evidence that the message reached multiple users.',
  },
];

const defaultTemplate = `Issue reported:
What I checked:
What I found:
Action taken:
Outcome:
Next step / follow-up needed:
`;

export default function SecurityAlertsPage() {
  const [selectedId, setSelectedId] = useState<string>(alertCategories[0].id);
  const [noteText, setNoteText] = useState(defaultTemplate);
  const category = useMemo(
    () => alertCategories.find((item) => item.id === selectedId) ?? alertCategories[0],
    [selectedId]
  );

  const copyNote = async () => {
    if (!navigator.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(noteText);
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <Card className="mb-6 border-slate-800 bg-slate-950 text-white">
          <CardHeader>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-cyan-400" />
                <CardTitle>Security Alert Triage</CardTitle>
              </div>
              <p className="max-w-3xl text-sm text-slate-300">
                Use this local guidance to classify common alert types, document first checks, and keep note scaffolds handy without storing raw alert data.
              </p>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 xl:grid-cols-[320px,1fr]">
          <div className="space-y-4">
            {alertCategories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`block w-full rounded-2xl border px-4 py-4 text-left transition ${
                  item.id === selectedId
                    ? 'border-cyan-400 bg-cyan-500/10 text-white'
                    : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-cyan-400 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.summary}</p>
                  </div>
                  <Badge variant="outline">Alert</Badge>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <Card className="border-slate-700 bg-slate-950 text-slate-100">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-cyan-400" />
                  <div>
                    <h2 className="text-lg font-semibold">{category.title}</h2>
                    <p className="text-sm text-slate-400">{category.summary}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">First checks</h3>
                  <ol className="mt-3 space-y-2 text-sm text-slate-300">
                    {category.checks.map((check) => (
                      <li key={check} className="flex gap-3">
                        <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-slate-950">•</span>
                        <span>{check}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Escalation trigger</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{category.escalation}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-950 text-slate-100">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Clipboard className="h-5 w-5 text-cyan-400" />
                  <CardTitle>Structured note scaffold</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="security-note">Note content</Label>
                  <Textarea
                    id="security-note"
                    className="min-h-[220px] bg-slate-900 text-slate-100"
                    value={noteText}
                    onChange={(event) => setNoteText(event.target.value)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm" onClick={copyNote}>
                    <ClipboardCopy className="mr-2 h-4 w-4" />
                    Copy note
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setNoteText(defaultTemplate)}
                  >
                    Reset scaffold
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-slate-200">
              <p className="font-semibold">Privacy guardrail</p>
              <p className="mt-2 leading-6 text-slate-300">
                Keep this page local-only. Do not paste sensitive user emails, IP addresses, tenant names, or raw alert headers unless you sanitize them first in the Alert Sanitizer page.
              </p>
              <div className="mt-4">
                <Button asChild variant="secondary" size="sm">
                  <Link href="/alert-sanitizer">Go to Alert Sanitizer</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
