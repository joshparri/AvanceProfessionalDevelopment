export interface SanitizerToken {
  token: string;
  label: string;
  original: string;
}

export interface SanitizedAlertResult {
  sanitizedText: string;
  tokens: SanitizerToken[];
  likelyType: string;
  priority: 'High' | 'Medium' | 'Low';
  firstSystem: string;
  immediateSteps: string[];
  escalationCondition: string;
}

const patterns: Array<{ label: string; regex: RegExp }> = [
  { label: 'Internal_URL', regex: /\bhttps?:\/\/[^\s<>"')]+/gi },
  { label: 'User_Email', regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  { label: 'IP_Address', regex: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g },
  { label: 'Phone_Number', regex: /(?:\+?61|0)[\s-]?(?:\d[\s-]?){8,10}\d/g },
  { label: 'Device_Name', regex: /\b(?:DESKTOP|LAPTOP|SERVER|PC|WIN|MAC|SRV|DC|NAS|VM)[A-Z0-9._-]{2,}\b/gi },
  { label: 'Client_Tenant', regex: /\b(?:tenant|client|company|organisation|organization|customer)\s*[:=-]\s*[A-Z][A-Za-z0-9&.' -]{2,60}/gi },
  { label: 'User_Name', regex: /\b(?:user|principal|actor|target|account)\s*[:=-]\s*[A-Z][A-Za-z.' -]{2,50}/gi },
];

function classifyAlert(text: string) {
  const lower = text.toLowerCase();

  if (/(impossible travel|foreign|outside australia|unusual sign|risky sign|successful sign-in|successful signin)/.test(lower)) {
    return {
      likelyType: 'Anomalous sign-in',
      priority: 'High' as const,
      firstSystem: 'M365 Admin / Entra sign-in logs',
      immediateSteps: [
        'Check sign-in result, MFA result, location category, and conditional access result.',
        'Confirm whether travel, VPN, or approved remote access explains the signal.',
        'If unexplained and successful, escalate before routine remediation.',
      ],
      escalationCondition: 'Escalate if the sign-in succeeded, MFA was satisfied unexpectedly, or the location is unexplained.',
    };
  }

  if (/(mfa|multi-factor|multifactor|security info|authentication method|strong authentication|disabled)/.test(lower)) {
    return {
      likelyType: 'MFA or security information change',
      priority: 'Medium' as const,
      firstSystem: 'M365 Admin / Entra authentication methods',
      immediateSteps: [
        'Identify whether MFA was weakened, added, removed, or admin-assisted.',
        'Check actor category and whether a matching support request exists.',
        'Escalate if the actor is unknown or MFA was weakened unexpectedly.',
      ],
      escalationCondition: 'Escalate when MFA was disabled, the actor is unknown, or the change aligns with suspicious sign-in activity.',
    };
  }

  if (/(consent|application|app permission|enterprise app|oauth|read\.ai|filenote|third-party)/.test(lower)) {
    return {
      likelyType: 'Application consent',
      priority: 'Medium' as const,
      firstSystem: 'Entra enterprise applications',
      immediateSteps: [
        'Review permission categories without copying sensitive values into local notes.',
        'Check whether the app is approved, expected, or previously vetted.',
        'Escalate broad or unknown consent for app review.',
      ],
      escalationCondition: 'Escalate when the publisher is unknown, permissions are broad, or consent was unexpected.',
    };
  }

  if (/(sentinelone|defender|malware|edr|endpoint|suspicious process|isolate|quarantine)/.test(lower)) {
    return {
      likelyType: 'Endpoint protection alert',
      priority: 'High' as const,
      firstSystem: 'SentinelOne / endpoint console',
      immediateSteps: [
        'Check severity, detection category, affected device state, and recurrence.',
        'Do not suppress, uninstall, or bypass protection to clear the alert.',
        'Escalate active threats, high severity detections, or unclear script execution.',
      ],
      escalationCondition: 'Escalate for active malware, high-severity detection, repeated alerting, or business-critical endpoints.',
    };
  }

  if (/(backup|veeam|datto|restore point|snapshot|vss|recovery)/.test(lower)) {
    return {
      likelyType: 'Backup failure or recovery risk',
      priority: 'Medium' as const,
      firstSystem: 'Backup console',
      immediateSteps: [
        'Check last successful backup before focusing on the latest failure.',
        'Check recurrence, affected workload category, and obvious failure cause.',
        'Escalate if recovery point age exceeds tolerance or failures repeat.',
      ],
      escalationCondition: 'Escalate when recent restore points are missing, failures repeat, or critical workloads are affected.',
    };
  }

  if (/(phish|mailbox|forwarding|inbox rule|credential|clicked|attachment|ironscales|defender for office)/.test(lower)) {
    return {
      likelyType: 'Phishing or mailbox security alert',
      priority: 'High' as const,
      firstSystem: 'M365 Defender / IRONSCALES',
      immediateSteps: [
        'Confirm whether the user clicked, entered credentials, opened attachments, or only reported the message.',
        'Check whether the message reached one mailbox or many.',
        'Escalate immediately if credentials were entered or mailbox persistence indicators exist.',
      ],
      escalationCondition: 'Escalate when credentials were entered, attachments were opened, multiple users are affected, or mailbox rules/forwarding changed.',
    };
  }

  return {
    likelyType: 'General monitoring alert',
    priority: 'Low' as const,
    firstSystem: 'Source monitoring console',
    immediateSteps: [
      'Identify the source system and whether the alert is informational, warning, or critical.',
      'Check current state before closing or acknowledging the alert.',
      'Create a follow-up reminder if the alert depends on a client, vendor, or teammate action.',
    ],
    escalationCondition: 'Escalate when the business impact, security risk, or required authority is unclear.',
  };
}

export function sanitizeAlert(rawText: string): SanitizedAlertResult {
  let sanitizedText = rawText;
  const tokens: SanitizerToken[] = [];
  const replacementMap = new Map<string, string>();
  const counters = new Map<string, number>();

  for (const { label, regex } of patterns) {
    sanitizedText = sanitizedText.replace(regex, (match) => {
      const normalized = `${label}:${match.toLowerCase()}`;
      const existing = replacementMap.get(normalized);

      if (existing) {
        return existing;
      }

      const nextCount = (counters.get(label) ?? 0) + 1;
      counters.set(label, nextCount);

      const token = `[${label}_${nextCount}]`;
      replacementMap.set(normalized, token);
      tokens.push({ token, label, original: match });

      return token;
    });
  }

  return {
    sanitizedText,
    tokens,
    ...classifyAlert(sanitizedText),
  };
}
