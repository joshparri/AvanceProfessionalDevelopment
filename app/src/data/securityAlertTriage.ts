import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  AppWindow,
  BadgeCheck,
  DatabaseBackup,
  Fingerprint,
  MailWarning,
  ShieldAlert,
} from 'lucide-react';

export type SecurityAlertSeverity = 'high' | 'medium' | 'low';

export interface SecurityAlertPath {
  id: string;
  title: string;
  severity: SecurityAlertSeverity;
  icon: LucideIcon;
  summary: string;
  firstSystem: string;
  firstChecks: string[];
  actionSteps: string[];
  escalationCondition: string;
  noteHints: {
    issue: string;
    checked: string;
    found: string;
    action: string;
    outcome: string;
    nextStep: string;
  };
}

export const securityAlertPaths: SecurityAlertPath[] = [
  {
    id: 'anomalous-sign-in',
    title: 'Anomalous or Foreign Sign-In',
    severity: 'high',
    icon: ShieldAlert,
    summary:
      'Use when an alert suggests impossible travel, unexpected country, unfamiliar IP, or a successful sign-in outside the expected pattern.',
    firstSystem: 'M365 Admin / Entra sign-in logs',
    firstChecks: [
      'Confirm whether the sign-in succeeded, failed, or only triggered a detection.',
      'Check the timestamp, country, device/browser, MFA result, and conditional access result.',
      'Check whether recent travel, VPN, or known remote access explains the activity.',
    ],
    actionSteps: [
      'If unexplained and successful, escalate before treating it as a routine password reset.',
      'Preserve the alert context in the ticket using placeholders, not raw emails or IP addresses.',
      'If directed, revoke sessions, force password reset, and check for mailbox forwarding or rule changes.',
    ],
    escalationCondition:
      'Escalate immediately when the sign-in succeeded, MFA was satisfied unexpectedly, the location is unexplained, or mailbox/account changes are visible.',
    noteHints: {
      issue: 'Monitoring alert reported an unusual sign-in pattern for a user account.',
      checked: 'Reviewed sign-in result, MFA result, location category, device/browser, and recent expected travel/VPN context.',
      found: 'Record whether the activity was expected, unexplained, failed-only, or successful.',
      action: 'Document verification, escalation, and any containment actions directed by senior staff.',
      outcome: 'State whether the alert was explained, escalated, or moved into containment.',
      nextStep: 'Follow senior-tech/security direction and confirm account state before closure.',
    },
  },
  {
    id: 'mfa-security-info-change',
    title: 'MFA or Security Info Change',
    severity: 'medium',
    icon: Fingerprint,
    summary:
      'Use for alerts where MFA was disabled, security info was added, or authentication methods changed.',
    firstSystem: 'M365 Admin / Entra authentication methods',
    firstChecks: [
      'Confirm the change type: disabled MFA, added method, removed method, or admin-assisted registration.',
      'Check whether the actor was an admin, the user, or unknown.',
      'Check whether the action happened inside an expected country and during a known support interaction.',
    ],
    actionSteps: [
      'If the change was expected, document the approval/support context.',
      'If the actor is unknown or the change weakens MFA, escalate before closing.',
      'If directed, require re-registration, reset credentials, or revoke sessions.',
    ],
    escalationCondition:
      'Escalate when MFA was weakened, the actor is unknown, the change was not requested, or the alert coincides with suspicious sign-ins.',
    noteHints: {
      issue: 'Monitoring alert reported a security information or MFA method change.',
      checked: 'Reviewed actor category, change type, country category, and whether a support request existed.',
      found: 'Record whether this appears expected, procedural, or suspicious.',
      action: 'Document verification, user/admin confirmation, and any remediation directed.',
      outcome: 'State whether MFA state is acceptable or requires further security review.',
      nextStep: 'Monitor for related sign-in alerts or complete the approved remediation.',
    },
  },
  {
    id: 'app-consent',
    title: 'User Consent to Application',
    severity: 'medium',
    icon: AppWindow,
    summary:
      'Use for alerts where a user or admin grants access to an app, browser plugin, meeting assistant, or AI note tool.',
    firstSystem: 'Entra enterprise applications',
    firstChecks: [
      'Identify the permission category without storing the app name in local state.',
      'Check whether the app is approved, previously vetted, or known to the business.',
      'Check whether consent scope includes mail, files, calendar, contacts, or offline access.',
    ],
    actionSteps: [
      'If approved and expected, document the approval source in the PSA.',
      'If broad permissions or unknown publisher, escalate for app review.',
      'If suspicious, advise senior staff before revoking access so evidence is preserved.',
    ],
    escalationCondition:
      'Escalate when the publisher is unknown, permissions are broad, consent was unexpected, or the app handles sensitive mail/files/calendar data.',
    noteHints: {
      issue: 'Monitoring alert reported consent granted to a third-party application.',
      checked: 'Reviewed permission category, publisher trust signal, approval status, and user expectation.',
      found: 'Record whether the app appears approved, unreviewed, or suspicious.',
      action: 'Document whether it was left in place, escalated, or queued for review.',
      outcome: 'State whether the consent event is accepted or pending security approval.',
      nextStep: 'Complete app review or confirm business approval in the approved system.',
    },
  },
  {
    id: 'account-enabled',
    title: 'Account Enabled or Privilege Change',
    severity: 'medium',
    icon: BadgeCheck,
    summary:
      'Use when an account is enabled, a privilege changes, or an identity lifecycle event occurs.',
    firstSystem: 'M365 Admin / Entra audit logs',
    firstChecks: [
      'Confirm actor category and target account category.',
      'Check whether there is an onboarding, reactivation, or access request.',
      'Check whether the actor location and timing align with normal administration.',
    ],
    actionSteps: [
      'Document the request or business context if known.',
      'If no matching request exists, escalate before assuming it is routine.',
      'Check whether the account has MFA, correct groups, and expected licensing state.',
    ],
    escalationCondition:
      'Escalate when the actor is unknown, no request exists, privilege increased unexpectedly, or the account is high-impact.',
    noteHints: {
      issue: 'Monitoring alert reported an account lifecycle or privilege-related change.',
      checked: 'Reviewed actor category, matching request, MFA state, group/licensing context, and timing.',
      found: 'Record whether the change aligns with expected administration.',
      action: 'Document verification or escalation path.',
      outcome: 'State whether the account state is accepted, pending approval, or under review.',
      nextStep: 'Confirm access owner approval or complete rollback if directed.',
    },
  },
  {
    id: 'endpoint-alert',
    title: 'Endpoint Protection Alert',
    severity: 'high',
    icon: AlertTriangle,
    summary:
      'Use when SentinelOne, Defender, or another endpoint tool reports suspicious behavior, malware, isolation, or agent health concerns.',
    firstSystem: 'SentinelOne / endpoint console',
    firstChecks: [
      'Confirm alert severity, detection name, affected device category, and current agent state.',
      'Check whether the device is isolated, online, or repeatedly alerting.',
      'Check recent user reports, software installs, and suspicious process/file activity.',
    ],
    actionSteps: [
      'Do not suppress or uninstall protection to make the alert disappear.',
      'Escalate active malware, lateral movement, repeated detections, or unclear high-severity events.',
      'If directed, isolate device, collect evidence, and coordinate user communication.',
    ],
    escalationCondition:
      'Escalate for any active threat, high-severity detection, unknown script execution, repeated alerts, or business-critical endpoint.',
    noteHints: {
      issue: 'Endpoint protection alert reported suspicious activity or agent concern.',
      checked: 'Reviewed severity, device state, detection category, recurrence, and user impact.',
      found: 'Record whether this appears active, contained, false positive, or requires investigation.',
      action: 'Document escalation, isolation, evidence collection, or approved remediation.',
      outcome: 'State device/account status and whether further monitoring is needed.',
      nextStep: 'Wait for senior/security review or complete approved remediation checklist.',
    },
  },
  {
    id: 'backup-failure',
    title: 'Backup Failure or Recovery Risk',
    severity: 'medium',
    icon: DatabaseBackup,
    summary:
      'Use for Veeam, Datto, or other backup alerts where the risk depends on last successful backup and recurrence.',
    firstSystem: 'Backup console',
    firstChecks: [
      'Check last successful backup before focusing on the latest failed job.',
      'Check whether the failure is one-off, repeated, or affecting multiple protected systems.',
      'Check storage, credentials, agent state, network path, and snapshot/VSS clues.',
    ],
    actionSteps: [
      'Record the recovery point age clearly in the ticket.',
      'Retry only when the failure mode supports a safe retry.',
      'Escalate if recovery point age exceeds tolerance or failures repeat.',
    ],
    escalationCondition:
      'Escalate when backups have failed repeatedly, no recent restore point exists, multiple systems are affected, or the protected workload is critical.',
    noteHints: {
      issue: 'Monitoring alert reported backup failure or recovery risk.',
      checked: 'Reviewed last successful backup, recurrence, affected workload category, and obvious failure cause.',
      found: 'Record recovery point age and whether the failure appears isolated or recurring.',
      action: 'Document retry, remediation, escalation, or monitoring action.',
      outcome: 'State current backup health and recovery risk.',
      nextStep: 'Confirm next backup success or escalate unresolved recovery risk.',
    },
  },
  {
    id: 'phishing-mailbox-alert',
    title: 'Phishing Report or Mailbox Security Alert',
    severity: 'high',
    icon: MailWarning,
    summary:
      'Use for reported phishing, malicious mail, mailbox rules, forwarding, or suspicious email security events.',
    firstSystem: 'M365 Defender / IRONSCALES',
    firstChecks: [
      'Confirm whether the user clicked, entered credentials, opened attachments, or only reported the message.',
      'Check message scope: single mailbox, multiple mailboxes, or active campaign.',
      'Check mailbox forwarding, rules, and recent sign-ins if credentials may have been entered.',
    ],
    actionSteps: [
      'If credentials were entered, treat as potential compromise and escalate immediately.',
      'Preserve message details in the approved security system, not local app storage.',
      'If directed, purge message, reset credentials, revoke sessions, and check mailbox persistence.',
    ],
    escalationCondition:
      'Escalate when credentials were entered, attachments were opened, multiple users are affected, or mailbox persistence indicators exist.',
    noteHints: {
      issue: 'Security alert or user report indicated possible phishing or mailbox compromise.',
      checked: 'Reviewed interaction level, message scope, mailbox rule/forwarding risk, and related sign-in context.',
      found: 'Record whether it is reported-only, clicked, credential-entered, or broader campaign.',
      action: 'Document containment, purge, escalation, and user guidance performed.',
      outcome: 'State whether the mailbox/account appears secured or still under review.',
      nextStep: 'Confirm remediation completion and monitor for related alerts.',
    },
  },
];
