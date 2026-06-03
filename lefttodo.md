# Avance Work Companion - Remaining Work & Prioritized Backlog

This file is the active master backlog for the app. Keep it current as work is completed.

## Current status
- Core PD pages and learning flows exist.
- Production build passes.
- Lint passes cleanly.
- Universal search is live and now includes pages plus local tasks, work logs, knowledge entries, playbooks, clients, and learning items.
- Work Logs, Tasks, Knowledge Base, Playbooks, and Clients now have local-first operational pages.
- Settings includes JSON backup and restore.
- Evidence Pack has a copy-summary button.
- MSP Scenario Trainer progress persists locally and the dropdown contrast fix is pushed.

## Completed in the latest implementation pass
- [x] Fix deploy-blocking lint errors.
- [x] Verify `npm run lint`, `npm run test`, and `npm run build`.
- [x] Push verified baseline to `main`.
- [x] Add Work Log edit/delete.
- [x] Add copyable Work Log handover summary.
- [x] Add Task edit flow.
- [x] Add Task overdue indicator.
- [x] Add copyable Task carry-forward summary.
- [x] Expand search to local records beyond pages.
- [x] Add search type filter.
- [x] Add recent search chips.
- [x] Add result highlighting.
- [x] Add Knowledge Base CRUD page.
- [x] Add Playbooks page with checklist-style steps.
- [x] Add Clients page for privacy-safe client references.
- [x] Add Knowledge Base, Playbooks, and Clients to navigation.
- [x] Link Work Logs, Tasks, Knowledge Base, Clients, and Playbooks.
- [x] Add local time/invoice tracking with shift/task links and invoice-cycle preview.
- [x] Add structured follow-up triage with status, due date, next nudge, priority, and editable wording.
- [x] Add Knowledge Base confidence ratings, verified status, playbook/log links, and privacy warnings.
- [x] Add Playbook runner completion state, usage tracking, and field notes.
- [x] Add KB Learning Machine queue filters, field card editing, and review statuses.

## High-priority remaining work

### 1. Workflow depth
- [x] Link work logs to tasks, knowledge entries, clients, and playbooks.
- [x] Link tasks to work logs, clients, and knowledge entries.
- [ ] Add shift detail improvements:
  - [ ] Time logging per shift.
  - [ ] Shift prep checklist refinements.
  - [ ] Linked shift work logs and tasks.
- [x] Add time/invoice tracking:
  - [x] Shift/task time entry.
  - [x] Invoice-cycle summary.
  - [x] Invoice preview.
  - [ ] Invoice export file generation.
- [x] Add structured follow-up triage:
  - [x] Status.
  - [x] Due date.
  - [x] Next nudge.
  - [x] Priority.
  - [x] Editable wording templates.

### 2. Knowledge and playbook maturity
- [x] Add confidence rating and verified status to Knowledge Base entries.
- [x] Link Knowledge Base entries to playbooks and logs.
- [x] Track Playbook usage and field notes.
- [x] Add Playbook runner completion state.
- [x] Add privacy linting or warnings for entries that look sensitive.
- [ ] Add internal notes/backlog area for safe non-sensitive bullets.

### 3. MSP professional development
- [ ] Add client communication practice prompts and model responses.
- [ ] Add more realistic scenarios:
  - [ ] Microsoft 365.
  - [ ] Endpoint support.
  - [ ] Networking.
  - [ ] Cybersecurity.
  - [ ] Backup/DR.
  - [ ] Communication.
- [ ] Convert remaining static Learning Cockpit activities into interactive variants.
- [ ] Improve Next Best Action / PD coaching:
  - [ ] Recommend one clear next action.
  - [ ] Explain "why this?"
  - [ ] Use more local progress data for decisions.
- [ ] Add manager-ready weekly PD review output.

### 4. KB Learning Machine
- [x] Add a dedicated learning queue.
- [x] Improve manual field card create/edit/delete flow.
- [x] Add review statuses:
  - [x] New.
  - [x] Due.
  - [x] Learning.
  - [x] Confident.
  - [x] Mastered.
- [ ] Add more local KB hint seed data without importing private KB content.

### 5. Search and discovery
- [ ] Add richer search result ranking for live records.
- [ ] Add direct record anchors or detail views for search results.
- [x] Add search coverage for invoices/time entries after those modules exist.
- [ ] Add empty-state suggestions based on content type.

### 6. Data quality, backup, and sync
- [ ] Add import validation before restoring backup JSON.
- [ ] Ensure backup export/import covers localStorage-based learning progress, not just Dexie tables.
- [ ] Decide whether cloud sync remains simulated or gets a real Supabase design.
- [ ] If real sync is pursued, design privacy, conflict resolution, and selective sync first.

### 7. QA and polish
- [x] Clear existing lint warnings.
- [ ] Add unit tests for search helpers and recommendation rules.
- [ ] Add integration tests for Work Logs, Tasks, Knowledge Base, Playbooks, and Clients.
- [ ] Run mobile layout QA.
- [ ] Run dark mode QA.
- [ ] Run keyboard/accessibility QA.
- [ ] Check seeded data for client-sensitive content.
- [ ] Add user-facing empty/loading states where still thin.

## Suggested next implementation sequence
1. Improve KB Learning Machine editing and review states.
2. Add communication practice and more MSP scenarios.
3. Add shift detail improvements.
4. Add backup validation and localStorage progress export.
5. Add search ranking/detail anchors and empty-state suggestions.
6. Add integration tests and mobile/dark/keyboard QA coverage.

## Verification baseline
Latest verified commands:
- `npm run lint` in `app/` passes cleanly.
- `npm run test` in `app/` passes.
- `npm run build` in `app/` passes.

Latest locally checked routes:
- `/tasks`
- `/work-logs`
- `/knowledge-base`
- `/playbooks`
- `/clients`
- `/search?q=backup`
- `/time-invoices`

## Notes
- Keep all new features local-first and privacy-safe.
- Do not add real PSA, Google, email, or AI integrations without a separate privacy and credentials design.
- Use generic examples and avoid passwords, secrets, private emails, hostnames, tenant IDs, or client-sensitive details.

## Documents accuracy
Some repository docs are out of sync with the current implementation. Quick audit shows these files contain statements that no longer match the codebase and should be reviewed/updated:

- `TODO.md` — many Work Logs / Tasks items are still marked unchecked despite being implemented in `app/`.
- `docs/deployment/vercel_deployment.md` — mentions 404s for pages that are now present / implemented.
- `docs/qa/msp_pd_smoke_test.md` — contains smoke test items that are now satisfied or need retesting (navigation links, scenario persistence).
- `README.md` and `lefttodo.md` — both are helpful but require a coordinated pass to ensure consistent status across summaries and checklists.
- Various `docs/*` files (implementation plans, guides) reference future routes or missing features; run a cross-docs check after a repo audit.

Recommended next step: perform a short doc-sync pass to update these files (or add a `docs/CHANGES.md` note) so `lefttodo.md` can remain the single source of truth.
