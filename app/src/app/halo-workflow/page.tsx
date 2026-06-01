'use client';

import Link from 'next/link';
import { AlertTriangle, ClipboardCopy, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const templates = [
  {
    title: 'Internal note',
    body: `Status: awaiting vendor / pending customer action\nWhat I checked: [summarise steps taken]\nWhat I found: [issue scope, current state]\nNext step: [who owns follow-up and timeline]`,
  },
  {
    title: 'Customer reply guidance',
    body: `Summary: [short explanation of what happened]\nImpact: [what is blocked or needs attention]\nNext step: [what the customer should do or expect]\nNote: This is a customer-facing update, not a private admin note.`,
  },
  {
    title: 'Billing handoff note',
    body: `Work completed: [list tasks performed]\nReason for handoff: [out-of-scope work, additional hardware, non-MSA job]\nPlease invoice: [billable setup, travel, parts, vendor coordination]\nStatus: awaiting invoice owner confirmation.`,
  },
];

export default function HaloWorkflowPage() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="border-slate-800 bg-slate-950 text-white">
          <CardHeader>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-cyan-400" />
                <CardTitle>HaloPSA Workflow Guardrails</CardTitle>
              </div>
              <p className="max-w-3xl text-sm text-slate-300">
                Compact reminders for status flow, enquiries vs support channels, private notes, and billing handoff language.
              </p>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 xl:grid-cols-[1fr,360px]">
          <div className="space-y-4">
            <Card className="border-slate-700 bg-slate-950 text-slate-100">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Ticket flow</Badge>
                  <CardTitle>Key reminders</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <div>
                  <p className="font-semibold">Enquiries vs support</p>
                  <p className="mt-2 leading-6">
                    If a ticket originated from the enquiries channel and you cannot reply, switch it to the support channel before sending a reply. This avoids hidden-ticket-view friction and blocked responses.
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Hidden ticket visibility</p>
                  <p className="mt-2 leading-6">
                    If you cannot see a ticket, check whether the current mailbox or user role is hiding it. Ask a teammate to review ticket visibility settings before assuming the ticket does not exist.
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Status guidance</p>
                  <ul className="mt-2 space-y-2 list-disc pl-5">
                    <li><strong>Resolved</strong>: completed work and no further action is expected.</li>
                    <li><strong>Awaiting invoice</strong>: work is complete, but billing handoff is required.</li>
                    <li><strong>Awaiting client</strong>: waiting for customer confirmation or access.</li>
                    <li><strong>Awaiting vendor</strong>: waiting on a third party or vendor response.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">Private note vs customer reply</p>
                  <p className="mt-2 leading-6">
                    Use private notes for internal troubleshooting, handoff details, or configuration checks. Use customer replies only when you are updating the client in plain language and the ticket is in the correct public-facing channel.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-950 text-slate-100">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-cyan-400" />
                  <CardTitle>Billing handoff checklist</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <ul className="space-y-2 list-disc pl-5">
                  <li>Confirm whether the work is covered by a managed service agreement.</li>
                  <li>Note any out-of-scope or additional work completed on-site.</li>
                  <li>Capture parts, travel, setup, and vendor coordination separately.</li>
                  <li>Set the ticket to <strong>Awaiting invoice</strong> when handoff is needed.</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {templates.map((template) => (
              <Card key={template.title} className="border-slate-700 bg-slate-950 text-slate-100">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Template</Badge>
                    <CardTitle>{template.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap rounded-2xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-200">{template.body}</pre>
                </CardContent>
              </Card>
            ))}

            <Card className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-cyan-300" />
                <p className="font-semibold">Use only generic workflow language</p>
              </div>
              <p className="mt-2 leading-6 text-slate-300">
                Keep note templates generic. Do not paste client names, internal account details, or credential information into these scaffolds.
              </p>
              <div className="mt-4">
                <Button asChild variant="secondary" size="sm">
                  <Link href="/vendor-remote-session">Vendor session coordinator</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
