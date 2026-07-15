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

# Avance Professional Development — Current State (Full Audit)

*Written from a direct read of the source code (not the README), July 2026. The existing
README's "not yet implemented" list is wrong — those features are built. Treat this doc
as the source of truth until it drifts, at which point: re-audit the code again, don't
trust docs alone.*

## Stack & architecture

- Next.js 16, React 19, TypeScript
- **Dexie (IndexedDB)** — fully local-first, no backend server. `AvanceDatabase` (Dexie
  class) currently at schema version 3, with tables: shifts, workLogs, tasks,
  pdAchievements, pdGoals, clients, projects, appSettings, knowledgeEntries, playbooks,
  learningItems, invoices, accounts, syncMetadata
- **Auth**: local only — email/password with client-side SHA-256 hashing stored in
  IndexedDB (`lib/auth.ts`). There is a `sync.ts` with sync-status metadata scaffolding,
  but it's a status tracker, not an actual cross-device sync engine — data lives in the
  browser it was created in
- 30 top-level routes under `src/app/`, ~30 shared components, dedicated `academy/` and
  `learning/` component sub-libraries for reusable UI (flashcards, scenario players,
  role-play chat, multiple-choice quiz, diagrams)

## Content datasets (what's actually populated, not just scaffolded)

| File | Size | Content |
|---|---|---|
| `mspLearningActivities.ts` | 1025 lines | **60 discrete learning activities** across 12 activity types: read, watch, flashcard, scenario, quiz, command-practice, ticket-note, roleplay, reflection, checklist, mini-project, troubleshooting-flow. Each has easy/medium/hard difficulty |
| `mspQuizQuestions.ts` | 825 lines | **49 quiz questions** |
| `mspSkills.ts` | 795 lines | **47 skills** across 15 categories: Networking (4), Microsoft 365 support (4), Windows troubleshooting (3), Service management (3), Scripting and automation (3), RMM and PSA operations (3), Intune and endpoint management (3), Helpdesk and triage (3), Escalation and professional judgement (3), Entra ID and identity (3), Endpoint support (3), Documentation (3), Cybersecurity (3), Client communication (3), Backup and disaster recovery (3) |
| `mspScenarios.ts` | 687 lines | **16 full ticket scenarios**, e.g. password reset/sign-in fail, Outlook mailbox not updating, OneDrive sync broken, Teams mic not working, printer not printing, Wi-Fi slow in one room, DNS/website failure, new staff onboarding, suspicious phishing email, backup job failed, Intune compliance missing, shared mailbox access, laptop running slowly, Windows update failed, client internet down |
| `externalLearningResources.ts` | 458 lines | **23 curated external links** — MS-102 (M365 Admin), MD-102 (M365 Endpoint Admin), Microsoft Entra Training, Intune Fundamentals, Defender Training, Google Skillshop, Google Workspace Training, plus general CS resources (Khan Academy, Harvard CS50x, MIT OCW, freeCodeCamp, W3Schools, Codecademy, edX, Coursera, OpenLearn) |
| `healthOutdoors.ts` | 553 lines | Reminder content across 9 categories: eyes, hydration, lunch, movement, outdoors, posture, shutdown, sleep, stress |
| `avanceGameContent.ts` | 455 lines | Gamified mode content across 6 domains (Helpdesk foundations, Microsoft 365, Identity & MFA, Networking, Security judgement, Cloud & automation), modelled against external platforms TryHackMe, Codewars, SadServers, Hack The Box |
| `kbFieldCards.ts` | 389 lines | **12 knowledge-base field cards** (spaced-repetition style) |
| `securityAlertTriage.ts` | 238 lines | Security alert triage scenario content |
| `toolPrimers.ts` | 269 lines | Reference primers: Windows Remote Desktop & RemoteApps, cert/TLS error troubleshooting, general connectivity troubleshooting tree, IRONSCALES & phishing setup, device setup & handoff checklist, Windows performance triage, profile migration & identity transition, KB maintenance tracker. (Also contains one unrelated stray entry — "LLM Creative Research: Castle Crydee (Fictional Architecture)" — worth checking if that's leftover test data) |
| `changeGuardrails.ts` | 159 lines | Change-management guardrail checks |
| `educationalGamePlatforms.ts` | 157 lines | References to Duolingo, GeoGuessr, Coolmath Games, Elevate, Khan Academy, AvanceGame (used as UX inspiration, not integrations) |

## Every route, with real maturity (page + component line counts)

| Route | Size | Status |
|---|---|---|
| `/msp-skills` | 380 lines | Full — skills matrix with readiness tracking |
| `/msp-scenarios` | 302 lines | Full — ticket scenario trainer |
| `/msp-quiz` | 507 lines | Full — quiz mode |
| `/msp-roadmap` | 364 lines | Full — 8-stage L1→L2 progression |
| `/ticket-notes` | 377 lines | Full — before/after ticket-note trainer with rubric |
| `/evidence-pack` | 624 lines | Full — manager-safe PD summary generator |
| `/learning-cockpit` | 864 lines | Full — flashcards, step-by-step drills, role-play chat |
| `/kb-learning-machine` | 1051 lines | Full — largest single route in the app |
| `/knowledge-base` | 448 lines | Full |
| `/tool-primers` | component 190 lines | Full |
| `/decision-tree` | 161 lines | Full — guided troubleshooting trees (email, Wi-Fi, new user setup, etc.) |
| `/security-alerts` + `/security-alert-triage` | 242 + 194 lines | Full |
| `/alert-sanitizer` + `/monitoring-alert-sanitizer` | 159 + 158 lines (components) | Full |
| `/change-guardrail` | component 181 lines | Full |
| `/onsite-checklist` | 333 lines | Full |
| `/vendor-remote-session` | component-backed | Full |
| `/work-logs` | 535 lines | Full — CRUD, categorised Support/Dev/Maintenance/Consulting/Training/Admin/Other |
| `/tasks` | 522 lines | Full |
| `/playbooks` | 370 lines | Full |
| `/clients` | 204 lines | Full — reference only, privacy-safe by design |
| `/shifts` | 249 lines | Full |
| `/time-invoices` | 369 lines | Full |
| `/health-outdoors` | 583 lines | Full |
| `/avance-game` | 346 lines | Full |
| `/settings` | 309 lines | Full — theme, backup export/import, data reset |
| `/search` | thin wrapper | Full (global search) |
| `/login`, `/signup` | 89 + 111 lines | Full — local auth only |

**Every route in the app is a real implementation. Nothing is a 404 stub — the README's
claim otherwise is outdated.**

## Confirmed gaps (checked every data file directly by grep, zero matches)

- **AZ-104 (Azure Administrator)** — no content anywhere
- **Ubiquiti / UniFi / UEWA** — no vendor-specific content; only one generic line about
  checking wireless signal/scope in the skills data
- **CompTIA Network+, Security+, Microsoft SC-900** — no content
- **ITIL 4 Foundation** — no content
- **A Cloud Guru / Pluralsight** — not referenced
- **Home lab / Proxmox guidance** — not applicable, hardware not app content
- **r/msp, MacAdmins/WinAdmins Discord** — not linked anywhere

## Known issues (from repo's own notes, still current)

- MSP Scenario Trainer progress dropdown has a display bug (black background on open,
  selection still works)
- KB Learning Machine is local-only — no import path from real Avance KB PDFs yet
- Auth is local-device-only; `sync.ts` tracks sync *status* but doesn't actually sync
  data across devices

## Open decision

A parallel build, **AvancePD** (separate repo, Vite/React instead of Next.js), covers
the same MSP-skills/scenario-trainer/evidence-pack ground. Worth deciding which repo is
canonical before adding the missing cert content above, so it isn't built twice.
