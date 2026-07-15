# Avance Professional Development — App Audit Report

*Built by running actual tooling against the codebase (npm audit, tsc, eslint, vitest,
a production build attempt) — not just reading files. Where a pillar genuinely can't be
assessed without a running/deployed app or a live userbase, that's stated plainly rather
than filled in with guesswork.*

---

## 1. Executive Summary

**App:** Avance Professional Development (repo: `AvanceProfessionalDevelopment`)
**Platform:** Web (Next.js 16 / React 19), local-first, single device, no backend
**Version:** 0.1.0
**Audience:** Personal tool, single user (Josh) — not a shipped multi-user product

**Health score: C+**

Reasoning: substantial, working feature set with clean lint and passing tests, but a
critical-severity dependency vulnerability, a broken production build in a sandboxed
network, near-zero test coverage, and a genuine risk of data loss (single-device
storage, no real backup enforcement) hold it back from a higher grade.

**Key findings & impact:**
- **Critical:** one dependency (`vitest`) has a critical-severity known vulnerability;
  `next` itself has 3 high-severity CVEs on the installed version (16.2.4 vs patched
  16.2.6+). Fixing this is a `npm audit fix` away for most of it — low effort, real risk
  reduction.
- **High:** all your PD data lives in one browser's IndexedDB with no automatic backup.
  A wiped browser profile or new machine loses everything unless you've manually used
  the settings-page export. This is the single biggest practical risk to the project.
- **Medium:** test coverage is effectively 1 test covering 1 utility function across a
  ~15,000-line codebase. Any regression in the 60 learning activities, 47 skills, or
  scenario logic would go undetected until you personally notice it.
- **Low:** two parallel repos (this one and `AvancePD`) duplicate the same feature set,
  splitting effort for no benefit.

---

## 2. UI/UX Evaluation

*Scope note: this is a static-code read, not a live click-through — I haven't run the
app in a browser and interacted with it. Findings below are what's inferable from the
component code; a real usability pass would need you walking me through it live or me
running it with a browser tool.*

**Usability & navigation:** Single shared `Navigation.tsx` and `Layout.tsx` wrap all 30
routes, which is good for consistency — one nav pattern instead of 30 bespoke ones.
`AuthGuard.tsx` gates authenticated routes. Global `/search` exists via `fuse.js`
fuzzy search.

**Accessibility (real gap, measured):**
- Zero `<img>` tags in the codebase — no raster images, so no alt-text problem by
  omission, but also means icon-only UI (`lucide-react`, used in 50 files) carries the
  weight, and icons need `aria-label`s to be screen-reader usable.
- Only **9 `aria-label` occurrences** across those 50+ icon-using files. That's a real
  accessibility gap — most icon-only buttons (save, delete, filter, expand, etc.) likely
  have no accessible name.
- Semantic HTML is present but thin: 1 `<nav>`, 1 `<header>`, 1 `<footer>`, 3 `<main>`
  across 30 routes — most pages likely reuse the shared layout's landmarks rather than
  adding their own, which is fine, but worth confirming nothing's nested wrong.
- Color contrast and font sizing can't be assessed from code alone — that needs a
  rendered check (browser devtools contrast checker or an automated tool like axe/Lighthouse
  run against the live app).

**Design consistency:** Uses shadcn/ui-style primitives (`ui/button.tsx`, `ui/card.tsx`,
`ui/dialog.tsx`, etc.) — a real design system, not one-off styled divs per page. Dark
mode is implemented (`dark-mode.tsx` context + toggle). This is a genuine strength —
consistent component library beats bespoke styling per route.

---

## 3. Technical & Codebase Analysis

**Architecture:** Next.js App Router, one route folder per feature (30 total), shared
component library split into general (`components/`), design-system primitives (`ui/`),
and learning-specific widgets (`academy/`, `learning/`). Data layer is Dexie (IndexedDB)
with a single `AvanceDatabase` class, now at schema version 3 (three real migrations —
shows the schema has evolved, not been static). Reasonably clean separation: `lib/` for
logic, `data/` for static content, `types/` for shared interfaces.

**Code quality — measured, not estimated:**
- `eslint`: **clean pass, zero errors, zero warnings.**
- `tsc --noEmit`: after a full dependency install, **zero real type errors** in
  application code. (An earlier partial-install run threw module-resolution errors —
  those were artifacts of an incomplete install, not real bugs; worth knowing in case
  you see similar noise locally with a stale `node_modules`.)
- Real TODO/FIXME comments in code: **zero.** (An earlier grep flagged 10 hits, but they
  were all `TaskStatus.TODO` / `LearningStatus.TODO` enum values, not actual "fix this
  later" comments — false positive, corrected here.)
- `console.log/error/warn` calls: **32** across the codebase — worth a pass to remove
  debug logging before treating this as production-grade, though harmless for a
  personal tool.
- No `any` types found — decent type discipline.

**Third-party libraries:** 14 direct dependencies, all current-generation (Next 16,
React 19, Dexie 4, Zod 4, Tailwind 4). No obvious redundancy or bloat — each dependency
maps to a real, distinct purpose (Dexie for storage, Zod for schema validation, Fuse.js
for search, date-fns for dates, Radix + shadcn for UI primitives). Nothing looks
speculative or unused at a glance.

**Test coverage — the weakest technical point:** exactly **one test file**
(`db-utils.test.ts`), **one test**, passing. For a codebase with 30 routes and ~6,000
lines of structured learning content plus the logic that drives it, this is
effectively no safety net. A change to `mspProgress.ts` or the scenario-scoring logic
could silently break and you wouldn't know until you personally hit the bug.

**Crashlytics & logs:** not applicable — there's no crash reporting service wired up
(expected for a local-only personal tool with no analytics backend). If you ever want
visibility into errors you hit while using it day-to-day, that would need to be added
deliberately (e.g. logging to a local file or an opt-in error log page) since there's
no server to report to.

---

## 4. Security & Compliance

**Data encryption & privacy:**
- No data leaves the device — everything is IndexedDB, no server calls, no API layer.
  There's genuinely nothing to intercept in transit because nothing is transmitted.
- Data **at rest is not encrypted** — IndexedDB in the browser is plaintext, readable
  by anything with access to the browser profile/device. For this app's content
  (PD notes, tasks, work logs) that's a low-stakes gap, but worth naming as a gap.
- GDPR/CCPA: not applicable in any meaningful sense — no data collection, no third
  party has your data, single local user. Compliance frameworks assume a data
  controller/processor relationship that doesn't exist here.

**Auth:** Local-only. Email + password, hashed client-side with SHA-256 before storage
in IndexedDB (`lib/auth.ts`). Two things worth flagging plainly:
- **SHA-256 alone is not a secure password hash** — it's fast, which is exactly wrong
  for password storage (makes brute-forcing cheap). A proper approach uses a slow,
  salted hash (bcrypt/scrypt/Argon2). Low real-world risk here since there's no server
  to attack and no remote login surface, but if this pattern ever gets reused in
  something with real exposure, it should be replaced.
- No JWT/OAuth because there's no backend to authenticate against — auth here is really
  just "gate the local UI," not a real authentication boundary.

**API & backend security:** not applicable — there is no backend, no API endpoints, no
network-facing surface. This pillar is close to N/A for this specific app.

**Vulnerability scanning (ran `npm audit`, real results):**

| Package | Severity | Fix available |
|---|---|---|
| vitest | **Critical** | Yes (major version bump) |
| next | **High** | Yes (patch: 16.2.4 → 16.2.6+) |
| form-data | High | Yes |
| vite | High | Yes |
| brace-expansion | Moderate | Yes |
| esbuild | Moderate | Yes |
| js-yaml | Moderate | Yes |
| postcss | Moderate | Yes |
| vite-node | Moderate | Yes |
| @babel/core | Low | Yes |

10 vulnerabilities total (1 critical, 3 high, 5 moderate, 1 low), **all with fixes
available.** The `next` one is the most consequential since it's a direct dependency —
two of its three advisories are DoS and middleware-bypass issues in App Router, patched
in 16.2.6. Recommend `npm audit fix` first (non-breaking fixes), then evaluate the
`vitest` major-version bump separately since that one's flagged as a breaking change.

---

## 5. Performance Metrics

**Honest scope limit:** none of this can be measured without a running, deployed
instance and real usage over time. I can't produce launch times, memory profiles, or
battery drain from static code — anyone claiming to hand you real numbers here without
running the app is making them up.

**What I could check, and did:**
- **Production build:** attempted `next build` — it **failed** in this sandbox because
  the build process needs to fetch Geist/Geist Mono from Google Fonts at build time and
  my environment's network is restricted to a small allowlist that doesn't include
  `fonts.googleapis.com`. This may well succeed fine on your machine or in Vercel's
  build environment where that domain isn't blocked — but it does surface a real
  characteristic worth knowing: **the build has a hard dependency on live internet
  access to Google's font CDN**, which is a bit of an odd requirement for an app whose
  whole selling point is local-first/offline. Worth checking it builds cleanly in your
  actual deploy pipeline, and considering self-hosting the fonts if you want build-time
  resilience.
- **Bundle size, caching strategy, offline functionality:** not assessable without a
  successful build to inspect, or the running app to test with devtools' network panel
  offline-throttling.

**Recommendation:** if performance is something you actually care about tracking, the
practical move is running Lighthouse against the deployed Vercel URL — that gives real
launch/interactivity/accessibility/best-practices scores in about 30 seconds, and I can
walk through the results with you if you paste them in.

---

## 6. Actionable Roadmap & Recommendations

| Priority | Issue | Effort | Action |
|---|---|---|---|
| **High** | Critical/high npm vulnerabilities (vitest, next, form-data, vite) | Low | Run `npm audit fix`; separately evaluate the vitest major-version bump |
| **High** | Single point of data-loss failure — no enforced backup | Medium | Add a reminder/prompt to use the existing export feature on a schedule, or auto-export to a downloads folder periodically |
| **High** | Near-zero test coverage on core learning/progress logic | Medium-High | Prioritize tests for `mspProgress.ts`, `mspQuizProgress.ts`, scoring/progress calculation — the logic most likely to silently break |
| **Medium** | Icon-only buttons largely missing `aria-label` | Medium | Sweep `lucide-react` icon usages, add labels — mechanical but time-consuming across 50 files |
| **Medium** | Two parallel repos (this one + AvancePD) duplicating effort | Decision, not build effort | Pick one as canonical, archive/retire the other |
| **Medium** | Build's hard dependency on live Google Fonts fetch | Low | Self-host Geist/Geist Mono fonts instead of `next/font/google` |
| **Low** | Password hashing is SHA-256, not a proper slow hash | Low | Swap to bcrypt/Argon2 if this auth model ever gets real exposure (low urgency for a local-only tool) |
| **Low** | 32 stray `console.log/error/warn` calls | Low | Clean up before treating as "production-grade," harmless otherwise |
| **N/A** | Missing cert content (AZ-104, Ubiquiti, Network+/Security+/SC-900, ITIL) | Medium-High | Carried over from earlier audit — this is a content gap, not a code-quality issue, but it's the actual reason this tool exists so still worth top billing in your own priority list |

**Strategic call:** refactor, don't rebuild. The architecture is sound (clean lint,
zero type errors, real schema migrations, sensible dependency choices) — the gaps are
in coverage (tests), hardening (deps, auth hash), and content (the certs), not in
fundamental design. Nothing here justifies a rewrite.

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
