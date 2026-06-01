import type { LucideIcon } from 'lucide-react';
import { KeyRound, Mail, MonitorCog, Network, Shield, ServerCog, Trash2, UsersRound } from 'lucide-react';

export interface ChangeGuardrailArea {
  id: string;
  title: string;
  icon: LucideIcon;
  risk: 'high' | 'medium';
  description: string;
  checks: string[];
  stopIf: string[];
}

export const changeGuardrailAreas: ChangeGuardrailArea[] = [
  {
    id: 'identity-provider',
    title: 'Identity Provider or Tenant-Wide Auth',
    icon: KeyRound,
    risk: 'high',
    description: 'Entra, Google Workspace, JumpCloud, GCPW, MFA defaults, conditional access, SSO, and account lifecycle changes.',
    checks: [
      'Confirm senior approval and exact tenant/account scope.',
      'Confirm a rollback path or break-glass route exists.',
      'Check expected user impact, including sign-in interruption and MFA prompts.',
      'Record where the approved change and evidence will live.',
    ],
    stopIf: [
      'You are changing a tenant-wide policy without explicit approval.',
      'Rollback is unclear or depends on the same setting being changed.',
      'The change could lock out administrators or service accounts.',
    ],
  },
  {
    id: 'email-security',
    title: 'Email Security or Phishing Tooling',
    icon: Mail,
    risk: 'high',
    description: 'IRONSCALES, Defender, SaaS defense removal, report phishing buttons, quarantine, country blocks, and VIP impersonation settings.',
    checks: [
      'Confirm the old and new protection systems and whether overlap/decommissioning is expected.',
      'Confirm licensed mailbox scope and exclusions.',
      'Check whether policy changes can block legitimate mail or trigger user-visible quarantine changes.',
      'Document the exact policy area, not raw tenant details.',
    ],
    stopIf: [
      'Vendor documentation conflicts with local senior-tech guidance.',
      'The change could block an entire country, domain, or broad mailbox group unexpectedly.',
      'You are removing old protection before the replacement is confirmed active.',
    ],
  },
  {
    id: 'endpoint-management',
    title: 'Endpoint Management or Security Agent',
    icon: MonitorCog,
    risk: 'high',
    description: 'RMM agents, SentinelOne/EDR, device isolation, agent removal, device enrollment, and performance-related agent changes.',
    checks: [
      'Confirm whether the issue is one device or many devices.',
      'Check whether the agent change affects monitoring, backup, security, or billing.',
      'Confirm senior approval before uninstalling or disabling security tooling.',
      'Record how the device will be returned to the standard stack.',
    ],
    stopIf: [
      'The device has an active security alert.',
      'You are disabling protection to improve performance without approval.',
      'There is no plan to restore the agent or verify final device health.',
    ],
  },
  {
    id: 'server-rdp',
    title: 'Server, RDP, or Remote Access',
    icon: ServerCog,
    risk: 'high',
    description: 'RDP certificate bindings, Remote Desktop Gateway, server permissions, VPN/RDG access, and RemoteApp feeds.',
    checks: [
      'Try to reproduce from a known-good internal path before changing the server.',
      'Confirm certificate expiry, trust chain, and private key permission evidence.',
      'Confirm the change window and affected users.',
      'Record the current setting before changing it.',
    ],
    stopIf: [
      'You are about to alter RDP security layer or encryption settings without senior direction.',
      'The issue affects multiple users and no one has confirmed the service-wide impact.',
      'You cannot describe the rollback step in one sentence.',
    ],
  },
  {
    id: 'network-dns',
    title: 'Network, DNS, or Domain Routing',
    icon: Network,
    risk: 'medium',
    description: 'DNS records, hosting cutovers, VPN paths, firewall rules, web go-live tasks, and remote connectivity routes.',
    checks: [
      'Confirm owner approval and the expected propagation or outage window.',
      'Capture current values before changing records or routes.',
      'Confirm who owns the external dependency if another provider is involved.',
      'Set a follow-up reminder for propagation or vendor response.',
    ],
    stopIf: [
      'The change may affect mail flow, website availability, VPN, or client access and no window is approved.',
      'You do not know which provider owns the current live record.',
      'Rollback values are not captured.',
    ],
  },
  {
    id: 'decommissioning',
    title: 'Tool Decommissioning or Migration',
    icon: Trash2,
    risk: 'high',
    description: 'Removing old security systems, moving away from JumpCloud, migration to Entra/GCPW, or profile migration at scale.',
    checks: [
      'Confirm the replacement state is active and tested.',
      'Confirm devices/users still reporting in old and new systems.',
      'Confirm licensing, billing, and service impact have an owner.',
      'Document staged rollout, exceptions, and rollback owner.',
    ],
    stopIf: [
      'The old tool is still the only confirmed control for any user or device.',
      'A migration step could strand a user profile or remove access without a fallback.',
      'Billing or licensing impact is unclear.',
    ],
  },
  {
    id: 'client-wide-app',
    title: 'Client-Wide App or Policy Rollout',
    icon: UsersRound,
    risk: 'medium',
    description: 'Report phishing buttons, signatures, Office setup, OneDrive policies, training campaigns, and standard app deployment.',
    checks: [
      'Confirm the target group, pilot scope, and success signal.',
      'Confirm user-facing communication or support expectation.',
      'Check whether the change creates tickets for other technicians.',
      'Record exceptions and who owns follow-up.',
    ],
    stopIf: [
      'The rollout target is broad and unconfirmed.',
      'There is no way to tell whether the rollout succeeded.',
      'Expected user-facing change has not been communicated.',
    ],
  },
  {
    id: 'security-incident',
    title: 'Security Incident Containment',
    icon: Shield,
    risk: 'high',
    description: 'Session revocation, password resets, mailbox purge, device isolation, app consent revocation, and suspicious account remediation.',
    checks: [
      'Preserve alert evidence in approved systems before disruptive action.',
      'Confirm escalation owner and containment order.',
      'Check whether actions could tip off an attacker or disrupt business-critical work.',
      'Record all actions with timestamps in the PSA/security system.',
    ],
    stopIf: [
      'You are unsure whether evidence has been preserved.',
      'The account/device is business-critical and containment has not been approved.',
      'The incident may affect more users than the original alert.',
    ],
  },
];
