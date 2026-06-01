export type ToolPrimerPriority = 'high' | 'medium' | 'low';

export interface ToolPrimerSection {
  title: string;
  body?: string;
  steps?: string[];
  keyOutputs?: string[];
  screenshots?: string[];
  warning?: string;
}

export interface ToolPrimer {
  id: string;
  title: string;
  description: string;
  priority: ToolPrimerPriority;
  tags: string[];
  toolUsed?: string;
  createdBy?: string;
  sections: ToolPrimerSection[];
}

export const toolPrimers: ToolPrimer[] = [
  {
    id: 'windows-rdp-remoteapps',
    title: 'Windows Remote Desktop & RemoteApps',
    description:
      'The primary method for clients to securely connect to on-premise servers or virtual desktop infrastructure, often managed through Remote Desktop Gateway, RemoteApp feeds, or access tools such as Pritunl and Work Resources.',
    priority: 'high',
    tags: ['rdp', 'remoteapps', 'certificates', 'tls', 'rdg', 'pritunl'],
    sections: [
      {
        title: 'What it is',
        body:
          'Remote Desktop and RemoteApps let users run applications or full desktops hosted on client infrastructure. In MSP support, failures often sit at the boundary between local client setup, VPN/RDG access, certificate trust, and server-side RDS configuration.',
      },
      {
        title: '"An internal error has occurred" - certificate or TLS issue',
        body:
          'This generic RDP error can occur when the Remote Desktop Services certificate has expired, the client does not trust the certificate chain, or the server cannot access the private key for its TLS credential. A useful server-side clue is event log error 0x8009030D, which indicates a TLS server credential private key problem.',
        steps: [
          'Ask what changed and capture the exact error text before attempting fixes.',
          'Try to reproduce the failure from an internal VM or known-good internal workstation. If the same error appears internally, treat it as likely server-side.',
          'For a safe client-side check, ask the user to refresh the RemoteApp feed through Control Panel > RemoteApp and Desktop Connections.',
          'If directed, install the approved latest .cer file, such as hinesrdpnew.cer when that is the current file, into both Current User and Local Machine certificate stores.',
          'If certificate trust is correct but the error persists, escalate for server-side RDP certificate binding, private key permission, and RDS security permission checks.',
        ],
        screenshots: [
          'Screenshot: Control Panel > RemoteApp and Desktop Connections showing the subscribed workplace feed and refresh/update action.',
        ],
        warning:
          'Do not attempt server-side changes, including altering RDP encryption or security layer settings, unless a senior technician directs you to do so.',
      },
      {
        title: 'General connectivity troubleshooting tree',
        steps: [
          'Confirm the user is connected to the expected access path: VPN, Pritunl, Remote Desktop Gateway, or the approved Work Resources feed.',
          'Check that the user is launching the correct RDP icon, RemoteApp icon, or .rdp file, especially if multiple old shortcuts exist.',
          'If the user is remote, check the server or endpoint status in Datto RMM before assuming the local machine is at fault.',
          'Compare one-user versus many-user impact. One user points toward shortcut, profile, VPN, local certificate, or permissions issues; many users points toward service, certificate, gateway, or server health.',
          'Document the exact path tested, error text, device name, access method, and whether the issue reproduced internally.',
        ],
      },
      {
        title: 'Ticket note checklist',
        steps: [
          'Record the exact RDP or RemoteApp error text and when it started.',
          'Record whether VPN/RDG/Work Resources was connected and refreshed.',
          'Record whether an internal VM reproduced the issue.',
          'Record any certificate file installed and which stores were used.',
          'Record escalation details if server-side certificate, private key, or RDS permission work is required.',
        ],
      },
    ],
  },
  {
    id: 'llm-creative-research-castle-crydee',
    title: 'LLM Creative Research: Castle Crydee (Fictional Architecture)',
    description:
      'An example of using generative AI for highly specific world-building and descriptive content, showing how LLMs can produce detailed architectural analysis of fictional structures.',
    priority: 'low',
    tags: ['llm', 'creative-research', 'world-building', 'low-priority'],
    toolUsed: 'Gemini/LLM',
    createdBy: 'Josh Parris',
    sections: [
      {
        title: 'What it is',
        body:
          'This note captures an informal creative research use case. It is useful as an example of structured prompt output, but it is intentionally low priority beside operational primers such as RDP troubleshooting.',
      },
      {
        title: 'Key outputs',
        keyOutputs: [
          'Structure Description: The castle is described as having a late Norman or early medieval northern European structure, with a central keep fortified by high walls and outbuildings built directly into the curtain walls.',
          'Layout Details: The castle sits on a large hill, separated from the town to the west by meadows and woodlands.',
          'Internal Features: Notable interior spaces include garrison quarters, a courtyard, and a large dining hall where Pug is mentored.',
        ],
      },
    ],
  },
  {
    id: 'ironscales-phishing-setup',
    title: 'IRONSCALES & Phishing Setup',
    description:
      'A focused setup primer for phishing reporting, mailbox scoping, VIP impersonation tagging, and safe migration away from older email security tools.',
    priority: 'high',
    tags: ['ironscales', 'phishing', 'email-security', 'm365', 'change-control'],
    sections: [
      {
        title: 'Pre-flight checks',
        steps: [
          'Confirm the approved client scope and whether this is a new deployment, adjustment, or migration from another email security tool.',
          'Confirm licensed mailbox count before enabling protection. Do not assume shared mailboxes or unlicensed accounts need the same treatment.',
          'Confirm the 911/report-phishing mailbox naming convention and whether it already exists.',
          'Confirm whether an older email security platform must be disabled only after the replacement is active.',
        ],
        warning:
          'Treat email security changes as tenant-impacting. Ask a senior technician before broad policy changes, country blocks, or decommissioning an old platform.',
      },
      {
        title: 'Setup path',
        steps: [
          'Create or verify the phishing reporting mailbox using the approved naming convention.',
          'Deploy the report-phishing button to the approved user scope.',
          'Enable IRONSCALES protection only for the approved licensed mailbox scope.',
          'Tag CEO, director, finance, and other approved high-risk roles for VIP impersonation protection.',
          'Review country blocking against local guidance. Do not blindly follow outdated vendor documentation.',
          'Confirm alerts, reporting flow, and user-visible behavior after deployment.',
        ],
      },
      {
        title: 'Ticket note checklist',
        steps: [
          'Record approved scope and senior approval source.',
          'Record mailbox count and role categories, not user-sensitive details.',
          'Record report button deployment status.',
          'Record old-platform decommission status if relevant.',
          'Record follow-up owner for any campaigns, training, or unresolved policy questions.',
        ],
      },
    ],
  },
  {
    id: 'device-setup-handoff',
    title: 'Device Setup & Handoff Checklist',
    description:
      'Repeatable setup flow for Windows and Mac devices, covering identity, productivity apps, endpoint tooling, handoff, and billing checks.',
    priority: 'high',
    tags: ['device-setup', 'windows', 'mac', 'entra', 'onedrive', 'billing'],
    sections: [
      {
        title: 'Setup checks',
        steps: [
          'Confirm device type, intended user role, required account platform, and whether the job is covered by an agreement.',
          'Install or verify Office apps, Outlook profile requirements, OneDrive sync, browser defaults, and required line-of-business apps.',
          'Enroll or join the device through the approved identity path, such as Entra, local domain, or Google Credential Provider for Windows.',
          'Install and confirm RMM, endpoint protection, backup agent, and any required compliance tooling.',
          'Confirm updates, restart state, disk encryption expectations, and local admin/support access method.',
        ],
      },
      {
        title: 'Handoff checks',
        steps: [
          'Confirm the user can sign in and open the required apps.',
          'Confirm Outlook/mail, OneDrive/files, printing, and browser access where in scope.',
          'Capture customer pickup or sign-off in the approved ticket system.',
          'Record exceptions such as missing passwords, pending licensing, vendor app work, or hardware accessories.',
          'If non-agreement work was completed, mark billing handoff clearly.',
        ],
      },
    ],
  },
  {
    id: 'windows-performance-triage',
    title: 'Windows Performance Triage',
    description:
      'Decision tree for slow laptops, freezing after login, high CPU, OneDrive pressure, and endpoint-agent performance concerns.',
    priority: 'medium',
    tags: ['performance', 'windows', 'sentinelone', 'onedrive', 'hardware'],
    sections: [
      {
        title: 'First checks',
        steps: [
          'Check Task Manager for CPU, memory, disk, startup app, and endpoint-agent pressure.',
          'Check OneDrive sync backlog, large libraries, sync errors, and whether thumbnails/files are constantly processing.',
          'Check pending restart, Windows Update, storage pressure, and obvious hardware symptoms.',
          'Check device architecture. ARM/Snapdragon devices may struggle with a standard MSP stack if tooling compatibility is poor.',
          'Ask whether the issue affects one user profile, all users on the device, or many devices.',
        ],
      },
      {
        title: 'Decision points',
        steps: [
          'If an endpoint agent is the top consumer, escalate before disabling or uninstalling protection.',
          'If OneDrive is the main pressure source, reduce sync scope or resolve sync errors before recommending replacement hardware.',
          'If the device is low-spec or incompatible with the required stack, document why an x64 business-grade replacement may be more reliable.',
          'If symptoms continue after safe cleanup, updates, restart, and profile checks, escalate for deeper diagnostics.',
        ],
        warning:
          'Do not disable security tooling as a performance fix unless a senior technician approves a reversible test and confirms the device will return to the standard baseline.',
      },
    ],
  },
  {
    id: 'profile-migration-identity-transition',
    title: 'Profile Migration & Identity Transition',
    description:
      'Primer for cached credential issues, new Windows profile decisions, Forensit migration, JumpCloud-to-Entra moves, and GCPW transitions.',
    priority: 'medium',
    tags: ['profile-migration', 'forensit', 'entra', 'gcpw', 'jumpcloud'],
    sections: [
      {
        title: 'When to use this',
        steps: [
          'Use when Windows keeps old tenancy credentials, apps loop authentication, or a device is moving between identity providers.',
          'Use when a profile must move from local/domain/JumpCloud identity to Entra or Google Credential Provider for Windows.',
          'Use when creating a new Windows profile may be faster and safer than clearing many cached credentials manually.',
        ],
      },
      {
        title: 'Migration checks',
        steps: [
          'Confirm Windows edition supports the planned migration path.',
          'Confirm old and new identity providers, device management owner, and sign-in method.',
          'Back up or confirm user data sync before profile migration.',
          'Use Forensit or the approved migration process when preserving profile state is required.',
          'Document PST/export or mail archive tasks separately if another technician owns them.',
          'For GCPW, confirm exact case-sensitive configuration in Google Admin before rollout.',
        ],
      },
      {
        title: 'Stop conditions',
        steps: [
          'Stop if the user has unsynced local data and no backup has been confirmed.',
          'Stop if the target identity provider is not ready or licensing/enrollment is unclear.',
          'Stop if the migration could strand remote access and no local admin/support path exists.',
        ],
      },
    ],
  },
  {
    id: 'kb-maintenance-tracker',
    title: 'Knowledge Base Maintenance Tracker',
    description:
      'Workflow for updating stale KB articles, vendor/admin portal links, screenshots, affected article counts, and publish status.',
    priority: 'medium',
    tags: ['knowledge-base', 'halo', 'documentation', 'maintenance'],
    sections: [
      {
        title: 'Update workflow',
        steps: [
          'Identify the stale KB article, old process/link, new process/link, and affected article count.',
          'Update screenshots or placeholders when the vendor UI changed.',
          'Record reviewer, publish status, and whether related articles need the same update.',
          'Add a follow-up reminder if the update depends on a senior review or vendor confirmation.',
        ],
      },
      {
        title: 'Note scaffold',
        steps: [
          'Issue: KB article contained stale vendor/admin portal guidance.',
          'What changed: Updated process/link/screenshot to current approved workflow.',
          'Validation: Checked affected articles and confirmed no client-sensitive values were added.',
          'Next step: Publish, review, or monitor for related stale articles.',
        ],
      },
    ],
  },
];
