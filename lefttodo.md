# Avance Work Companion - Remaining Work & Prioritized Backlog

This file is the active master backlog for the app. Keep it current as work is completed.

## Current status
- Core PD pages and learning flows exist.
- Production build passes.
- Lint passes with warnings only.
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

## High-priority remaining work

### 1. Workflow depth
- [ ] Link work logs to tasks, knowledge entries, clients, and playbooks.
- [ ] Link tasks to work logs, clients, and knowledge entries.
- [ ] Add shift detail improvements:
  - [ ] Time logging per shift.
  - [ ] Shift prep checklist refinements.
  - [ ] Linked shift work logs and tasks.
- [ ] Add time/invoice tracking:
  - [ ] Shift/task time entry.
  - [ ] Invoice-cycle summary.
  - [ ] Invoice preview/export.
- [ ] Add structured follow-up triage:
  - [ ] Status.
  - [ ] Due date.
  - [ ] Next nudge.
  - [ ] Priority.
  - [ ] Editable wording templates.

### 2. Knowledge and playbook maturity
- [ ] Add confidence rating and verified status to Knowledge Base entries.
- [ ] Link Knowledge Base entries to playbooks and logs.
- [ ] Track Playbook usage and field notes.
- [ ] Add Playbook runner completion state.
- [ ] Add privacy linting or warnings for entries that look sensitive.
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
- [ ] Add a dedicated learning queue.
- [ ] Improve manual field card create/edit/delete flow.
- [ ] Add review statuses:
  - [ ] New.
  - [ ] Due.
  - [ ] Learning.
  - [ ] Confident.
  - [ ] Mastered.
- [ ] Add more local KB hint seed data without importing private KB content.

### 5. Search and discovery
- [ ] Add richer search result ranking for live records.
- [ ] Add direct record anchors or detail views for search results.
- [ ] Add search coverage for invoices/time entries after those modules exist.
- [ ] Add empty-state suggestions based on content type.

### 6. Data quality, backup, and sync
- [ ] Add import validation before restoring backup JSON.
- [ ] Ensure backup export/import covers localStorage-based learning progress, not just Dexie tables.
- [ ] Decide whether cloud sync remains simulated or gets a real Supabase design.
- [ ] If real sync is pursued, design privacy, conflict resolution, and selective sync first.

### 7. QA and polish
- [ ] Clear existing lint warnings.
- [ ] Add unit tests for search helpers and recommendation rules.
- [ ] Add integration tests for Work Logs, Tasks, Knowledge Base, Playbooks, and Clients.
- [ ] Run mobile layout QA.
- [ ] Run dark mode QA.
- [ ] Run keyboard/accessibility QA.
- [ ] Check seeded data for client-sensitive content.
- [ ] Add user-facing empty/loading states where still thin.

## Suggested next implementation sequence
1. Link Work Logs, Tasks, Knowledge Base, Clients, and Playbooks.
2. Add time/invoice tracking.
3. Improve KB Learning Machine editing and review states.
4. Add communication practice and more MSP scenarios.
5. Add backup validation and localStorage progress export.
6. Clear lint warnings and add tests.

## Verification baseline
Latest verified commands:
- `npm run lint` in `app/` passes with warnings.
- `npm run test` in `app/` passes.
- `npm run build` in `app/` passes.

Latest locally checked routes:
- `/tasks`
- `/work-logs`
- `/knowledge-base`
- `/playbooks`
- `/clients`
- `/search?q=backup`

## Notes
- Keep all new features local-first and privacy-safe.
- Do not add real PSA, Google, email, or AI integrations without a separate privacy and credentials design.
- Use generic examples and avoid passwords, secrets, private emails, hostnames, tenant IDs, or client-sensitive details.
