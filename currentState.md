# Avance Professional Development — Current State

*Written from a direct read of the source code (not the README), July 2026. The existing
README's "not yet implemented" list is out of date — those features are built. This doc
replaces that claim and should be treated as the source of truth until it drifts too, at
which point: re-audit the code again, don't trust docs on their own.*

**Stack:** Next.js 16, React 19, TypeScript, Dexie (IndexedDB) for local-first storage,
auth context + login/signup pages.

## Fully implemented features (real pages, real data, real local DB)

| Route | Approx. size | What it does |
|---|---|---|
| `/msp-skills` | 380 lines + 795-line dataset | Skills matrix across 15 categories (Helpdesk, M365, Entra ID, Intune, Networking, Cybersecurity, Backup/DR, Scripting, Service management, etc.) with readiness tracking |
| `/msp-scenarios` | 302 lines + 687-line dataset | Ticket-scenario trainer — practise troubleshooting/escalation judgement against realistic MSP tickets |
| `/msp-quiz` | 507 lines + 825-line question bank | Quiz mode against the skills content |
| `/msp-roadmap` | 364 lines | 8-stage progression from L1 helpdesk foundations to L2/client ownership |
| `/ticket-notes` | 377 lines | Ticket-notes trainer — before/after examples, quality rubric |
| `/evidence-pack` | 624 lines | Generates manager-safe PD summaries from completed activity |
| `/learning-cockpit` | 864 lines | Free-text flashcards, step-by-step troubleshooting drills, role-play chat practice |
| `/kb-learning-machine` | 1051 lines + 389-line field cards | Spaced-repetition style knowledge base drills |
| `/knowledge-base` | 448 lines | KB content/reference area |
| `/tool-primers` | component: 190 lines | Reference primers — e.g. Windows Remote Desktop, IRONSCALES/phishing setup, device handoff checklist, Windows performance triage, profile migration |
| `/decision-tree` | 161 lines | Guided troubleshooting decision trees |
| `/security-alerts`, `/security-alert-triage` | 242 + component 194 lines | Security alert handling practice |
| `/alert-sanitizer`, `/monitoring-alert-sanitizer` | components 159 + 158 lines | Alert-cleanup/triage practice tools |
| `/change-guardrail` | component: 181 lines | Change-management guardrail checks |
| `/onsite-checklist` | 333 lines | Onsite visit checklist |
| `/vendor-remote-session` | component-backed | Vendor remote session handling |
| `/work-logs` | 535 lines | Full CRUD work log, categorised (Support/Dev/Maintenance/Consulting/Training/Admin/Other) |
| `/tasks` | 522 lines | Task tracker |
| `/playbooks` | 370 lines | Playbook library |
| `/clients` | 204 lines | Client reference list (kept privacy-safe per repo policy — no real client data) |
| `/shifts` | 249 lines | Shift tracking |
| `/time-invoices` | 369 lines | Time/invoice tracking |
| `/health-outdoors` | 583 lines + 553-line dataset | Hydration, screen-break, daylight, movement, shutdown reminders |
| `/avance-game` | 346 lines + 455-line dataset | Gamified learning mode — includes references to external platforms like TryHackMe/Hack The Box as "mimic" models |
| `/settings` | 309 lines | Theme, backup export/import, data reset |
| `/search` | thin wrapper | Global search |
| `/login`, `/signup` | 89 + 111 lines | Auth |

## External learning resources already curated (`externalLearningResources.ts`, 458 lines, 23 entries)

Includes direct links to:
- **MS-102T00** (Microsoft 365 Administrator) — Microsoft Learn
- **MD-102T00** (Microsoft 365 Endpoint Administrator) — Microsoft Learn
- Microsoft Entra Training, Microsoft Intune Fundamentals, Microsoft Defender Training
- Google Skillshop, Google Workspace Training
- General CS/networking: Khan Academy, Harvard CS50x, MIT OCW, freeCodeCamp, W3Schools, Codecademy, edX, Coursera, OpenLearn

`avanceGameContent.ts` also references **TryHackMe** and **Hack The Box** as cybersecurity practice platforms (used as a gamification model, not deep-linked/integrated).

## Confirmed gaps (checked every data file directly — zero matches)

- **AZ-104 (Azure Administrator)** — no content anywhere
- **Ubiquiti / UniFi / UEWA** — no vendor-specific content at all; only one generic line about checking wireless signal/scope
- **CompTIA Network+ / Security+, Microsoft SC-900** — no content
- **ITIL 4 Foundation** — no content
- **A Cloud Guru / Pluralsight** — not referenced
- **Home lab / Proxmox guidance** — not applicable (hardware, not app content)
- **r/msp, MacAdmins/WinAdmins Discord** — not linked anywhere

## Known issues carried over from repo notes

- MSP Scenario Trainer progress dropdown has a display bug (black background, selection still works)
- KB Learning Machine is local-only — no import path yet from real Avance KB PDFs

## Suggested next step

Two parallel builds exist for this same purpose — **AvanceProfessionalDevelopment** (this
one, Next.js) and **AvancePD** (Vite/React, separate repo). Worth deciding which one is
canonical before adding more features, so effort doesn't keep splitting across both.
