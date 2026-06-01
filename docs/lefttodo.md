# AvancePD Remaining Work

This file captures the current remaining work for the app based on the documented product vision, backlog notes, and QA checklist.

## 1. MSP Professional Development feature build
- Add the MSP data and type foundations:
  - `app/src/types/msp.ts`
  - `app/src/data/mspSkills.ts`
  - `app/src/data/mspScenarios.ts`
  - `app/src/data/mspRoadmap.ts`
  - `app/src/data/communicationPrompts.ts`
- Build the core MSP pages:
  - `/msp-skills`
  - `/msp-scenarios`
  - `/ticket-notes`
  - `/evidence-pack`
  - `/msp-roadmap`
- Create the interactive components and flows for:
  - Skills matrix cards and readiness badges
  - Scenario picker + practice flow
  - Ticket notes trainer with rubric/examples
  - Evidence summary with Markdown export and copy
  - Communication practice prompts and tone checklist
- Implement persistence and progress tracking:
  - Skill readiness persistence
  - Scenario progress persistence
  - Local evidence records and snapshots
  - Next-action recommendations from incomplete work
- Seed real MSP learning content:
  - 15+ realistic generic scenarios
  - MSP skill taxonomy and categories
  - KB field cards and spaced review seed data
  - More M365, endpoint, networking, cybersecurity, backup/DR, and communication scenarios

## 2. App workflow improvements
- Add a `PendingActionTracker` / follow-up tracker for stalled tickets
- Expand the Onsite Checklist workflow with:
  - remote access / third-party coordination checks
  - follow-up scheduling before leaving site
- Add more tool primers and knowledge capture:
  - RDP / RemoteApps troubleshooting primer
  - Creative AI prompts and research notes section
  - Security alert triage and sanitized monitoring alert workflow
- Add a privacy-safe internal notes / backlog area
- Hide or clearly label broken/not-yet-built routes:
  - Work Logs, Tasks, Knowledge, Playbooks, Clients, Learning

## 3. Known QA and deployment fixes
- Fix `/msp-scenarios` dropdown styling so options remain visible
- Add a “Copy summary” button on Evidence Pack Markdown output
- Add Ticket Notes Trainer to navigation
- Fix navigation links that currently lead to 404 pages
- Validate the app by running:
  - `npm run build`
  - `npm run lint`

## 4. Product alignment and documentation
- Review `docs/professional_development/msp_pd_growth_todo.md` against `docs/requirements/prd.md`
- Decide whether `Learning` should be a grouped nav section or a single page
- Decide whether MSP progress should use dedicated Dexie tables or map into existing tables
- Add acceptance criteria for each MSP Academy page to the PRD
- Update architecture docs after implementation
- Keep all new features local-first, privacy-safe, and free of client-sensitive data

## 5. Current repo notes
- This branch is currently on `main`
- There are existing uncommitted app changes in the working tree
- This file update is intended to capture the remaining product work clearly

---

## Primary reference docs
- `README.md`
- `TODO.md`
- `docs/app-improvement-suggestions.md`
- `docs/proposed-improvements-from-docs1.md`
- `docs/professional_development/msp_pd_growth_todo.md`
- `docs/qa/msp_pd_smoke_test.md`
