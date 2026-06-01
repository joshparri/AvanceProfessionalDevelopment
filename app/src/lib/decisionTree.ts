export type DecisionTreeOption = {
  label: string;
  nextId: string;
};

export type DecisionTreeNode = {
  id: string;
  title: string;
  question: string;
  description?: string;
  options: DecisionTreeOption[];
};

export const decisionTreeRootId = 'root';

export const decisionTreeNodes: DecisionTreeNode[] = [
  {
    id: decisionTreeRootId,
    title: 'Troubleshooting guide',
    question: 'What kind of issue do you need to resolve today?',
    options: [
      { label: 'Email not sending', nextId: 'email-not-sending' },
      { label: 'Wi-Fi not working', nextId: 'wifi-not-working' },
      { label: 'New user setup', nextId: 'new-user-setup' },
    ],
  },
  {
    id: 'email-not-sending',
    title: 'Email not sending',
    question: 'What best describes the email issue?',
    description: 'Start with client access, authentication, and outbound service checks.',
    options: [
      { label: 'Mail server rejects messages', nextId: 'email-bounce' },
      { label: 'Message appears stuck in Outbox', nextId: 'email-outbox' },
      { label: 'Authentication or MFA problem', nextId: 'email-auth' },
    ],
  },
  {
    id: 'wifi-not-working',
    title: 'Wi-Fi troubleshooting',
    question: 'Which symptom best matches the user report?',
    description: 'Follow a safe network triage path to avoid unnecessary changes.',
    options: [
      { label: 'No Wi-Fi networks visible', nextId: 'wifi-no-networks' },
      { label: 'Connected but no internet', nextId: 'wifi-connected-no-internet' },
      { label: 'Intermittent signal or disconnects', nextId: 'wifi-intermittent' },
    ],
  },
  {
    id: 'new-user-setup',
    title: 'New user setup',
    question: 'What stage is the new user at?',
    description: 'Capture requirements, verify identity, then configure access and devices.',
    options: [
      { label: 'Account creation and access', nextId: 'user-account' },
      { label: 'Device provisioning', nextId: 'user-device' },
      { label: 'Email and application setup', nextId: 'user-email' },
    ],
  },
  {
    id: 'email-bounce',
    title: 'Email bounce',
    question: 'Recommended checks for bounce messages',
    description: 'Review the bounce reason, mail server reputation, and recipient address formatting.',
    options: [
      { label: 'View recommended actions', nextId: 'result-email-bounce' },
    ],
  },
  {
    id: 'email-outbox',
    title: 'Outbox stuck',
    question: 'Recommended checks for messages stuck in Outbox',
    description: 'Confirm network connectivity, mailbox size, and mail client sync state.',
    options: [
      { label: 'View recommended actions', nextId: 'result-email-outbox' },
    ],
  },
  {
    id: 'email-auth',
    title: 'Authentication issue',
    question: 'Recommended checks for auth or MFA failures',
    description: 'Validate credentials, MFA prompts, and conditional access policy impacts.',
    options: [
      { label: 'View recommended actions', nextId: 'result-email-auth' },
    ],
  },
  {
    id: 'wifi-no-networks',
    title: 'No networks visible',
    question: 'Recommended checks when no Wi-Fi SSIDs appear',
    description: 'Check radio state, airplane mode, Wi-Fi adapter drivers and access point coverage.',
    options: [
      { label: 'View recommended actions', nextId: 'result-wifi-no-networks' },
    ],
  },
  {
    id: 'wifi-connected-no-internet',
    title: 'Connected but no internet',
    question: 'Recommended checks when the client is connected but cannot reach the internet',
    description: 'Review IP addressing, gateway reachability and DNS resolution first.',
    options: [
      { label: 'View recommended actions', nextId: 'result-wifi-connected-no-internet' },
    ],
  },
  {
    id: 'wifi-intermittent',
    title: 'Intermittent Wi-Fi',
    question: 'Recommended checks for unstable Wi-Fi',
    description: 'Investigate signal strength, channel interference, and client roaming behavior.',
    options: [
      { label: 'View recommended actions', nextId: 'result-wifi-intermittent' },
    ],
  },
  {
    id: 'user-account',
    title: 'New user account',
    question: 'Recommended checks for account creation and access',
    description: 'Verify licensing, group membership and MFA rules before provisioning mailbox access.',
    options: [
      { label: 'View recommended actions', nextId: 'result-user-account' },
    ],
  },
  {
    id: 'user-device',
    title: 'Device provisioning',
    question: 'Recommended checks for device provisioning',
    description: 'Confirm hardware inventory, OS image version, and network connectivity before handover.',
    options: [
      { label: 'View recommended actions', nextId: 'result-user-device' },
    ],
  },
  {
    id: 'user-email',
    title: 'Email and apps',
    question: 'Recommended checks for email and application setup',
    description: 'Set up mailbox access, app credentials, and vendor portal links in a repeatable order.',
    options: [
      { label: 'View recommended actions', nextId: 'result-user-email' },
    ],
  },
  {
    id: 'result-email-bounce',
    title: 'Email bounce actions',
    question:
      'Actions: review the bounce code, verify sender and recipient addresses, and check outbound SMTP policies.',
    options: [{ label: 'Restart guide', nextId: decisionTreeRootId }],
  },
  {
    id: 'result-email-outbox',
    title: 'Outbox stuck actions',
    question:
      'Actions: confirm network, clear the outbox, sign out and back in, and verify sending from webmail if needed.',
    options: [{ label: 'Restart guide', nextId: decisionTreeRootId }],
  },
  {
    id: 'result-email-auth',
    title: 'Authentication actions',
    question:
      'Actions: validate credentials, check MFA prompts, confirm device compliance, and review conditional access rules.',
    options: [{ label: 'Restart guide', nextId: decisionTreeRootId }],
  },
  {
    id: 'result-wifi-no-networks',
    title: 'No networks actions',
    question:
      'Actions: enable Wi-Fi, disable airplane mode, reboot the adapter, and confirm the correct SSID is broadcasting.',
    options: [{ label: 'Restart guide', nextId: decisionTreeRootId }],
  },
  {
    id: 'result-wifi-connected-no-internet',
    title: 'No internet actions',
    question:
      'Actions: check the gateway, test DNS, use alternate DNS, and verify whether the issue affects multiple devices.',
    options: [{ label: 'Restart guide', nextId: decisionTreeRootId }],
  },
  {
    id: 'result-wifi-intermittent',
    title: 'Intermittent Wi-Fi actions',
    question:
      'Actions: assess signal strength, change channels, move the client closer, and schedule a full access point review.',
    options: [{ label: 'Restart guide', nextId: decisionTreeRootId }],
  },
  {
    id: 'result-user-account',
    title: 'New account actions',
    question:
      'Actions: verify licensing, confirm directory sync, set up MFA, and document account details for handover.',
    options: [{ label: 'Restart guide', nextId: decisionTreeRootId }],
  },
  {
    id: 'result-user-device',
    title: 'Device provisioning actions',
    question:
      'Actions: verify hardware, install required software, join the device to the network, and hand over device credentials securely.',
    options: [{ label: 'Restart guide', nextId: decisionTreeRootId }],
  },
  {
    id: 'result-user-email',
    title: 'User email actions',
    question:
      'Actions: complete email setup, verify app access, document login steps, and check that the user can send and receive messages.',
    options: [{ label: 'Restart guide', nextId: decisionTreeRootId }],
  },
];

export const getDecisionTreeNodeById = (id: string) =>
  decisionTreeNodes.find((node) => node.id === id);
