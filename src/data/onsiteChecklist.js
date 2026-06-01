export const onsitePhases = [
  {
    id: 'precheck',
    title: 'Before Leaving Office',
    subtitle: 'Pre-check',
    steps: [
      {
        id: 'hardware-components',
        text: 'Confirm all required hardware components are present and correct.',
        detail: 'Box, screen, 2x power cables, screen cable, mounts/adapters, labels, and any client-approved peripherals.',
      },
      {
        id: 'myer-induction',
        text: 'If visiting a Myer store location, complete the mandatory 10-minute Myer Induction.',
        detail: 'Do not travel before the induction requirement is complete and noted.',
      },
      {
        id: 'issue-playbooks',
        text: 'Review relevant issue playbooks for likely side issues.',
        detail: 'Printer, networking, hardware, POS, and remote access notes.',
      },
      {
        id: 'physical-tools',
        text: 'Check physical tools and cables.',
        detail: 'Monitor setup tools, spare display cables, ethernet leads, cable run supplies, power board, and basic hand tools.',
      },
    ],
  },
  {
    id: 'onsite',
    title: 'Onsite Execution',
    subtitle: 'Work execution',
    steps: [
      {
        id: 'arrival-status',
        text: 'Log arrival status in HaloPSA.',
        detail: 'Use only the ticket ID in this app. Keep client notes inside HaloPSA.',
      },
      {
        id: 'vendor-passwords',
        text: "CRITICAL: Call the vendor's support line for POS passwords and PINs before setup.",
        detail: 'General support number: 03 9095 7979.',
        critical: true,
      },
      {
        id: 'install-work',
        text: 'Complete device imaging, hardware installation, and cable runs.',
        detail: 'Photograph/capture install evidence only in approved systems, not this local app.',
      },
      {
        id: 'scope-exception',
        text: "Note any work outside the defined replacement scope as an 'Exception' for invoicing.",
        detail: "Example category: unrelated printer issue resolved during visit. Do not store client details here.",
      },
      {
        id: 'user-signoff',
        text: 'Obtain user sign-off or confirmation of work completion.',
        detail: 'Record the sign-off in HaloPSA or the approved job system.',
      },
    ],
  },
  {
    id: 'closure',
    title: 'After Visit',
    subtitle: 'Closure',
    steps: [
      {
        id: 'note-template',
        text: 'Use the Note Template Generator to create structured notes for HaloPSA.',
        detail: 'Placeholder integration: open the Note Template Generator module when available.',
        integration: 'Note Template Generator',
      },
      {
        id: '3cx-away',
        text: 'CRITICAL REMINDER: Did you set 3CX to Away?',
        detail: 'Check 3CX before driving, packing down, or closing the ticket.',
        critical: true,
        integration: '3CX reminder',
      },
      {
        id: 'ticket-status',
        text: 'Update ticket status to resolved or awaiting follow-up.',
        detail: 'If follow-up is needed, set a due time and owner in the ticketing workflow.',
      },
    ],
  },
]
