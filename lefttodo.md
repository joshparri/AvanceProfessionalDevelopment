# Avance Work Companion — Remaining Work & Prioritized Backlog

This file is now the active master backlog for the app.

## Current status
- Core PD pages and learning flows exist
- Universal search is implemented
- Top navigation scroll and search page are live
- Most operational modules are still unbuilt or incomplete

## High-priority work
These items should be tackled first.

### 1. Core workflow modules
- [ ] Work Logs
  - [ ] Quick capture form for log entries
  - [ ] Saved log list with search/filter
  - [ ] Link logs to clients, tasks, and knowledge
  - [ ] Export or copy handover summary
- [ ] Tasks
  - [ ] CRUD for tasks
  - [ ] Priority, due date, and status workflow
  - [ ] Overdue visual indicators
  - [ ] Carry-forward follow-up tasks between shifts
- [ ] Knowledge Base
  - [ ] Entry editor with title/body/tags
  - [ ] Confidence rating and verified status
  - [ ] Searchable knowledge entries
  - [ ] Link knowledge to playbooks and logs
- [ ] Playbooks
  - [ ] Create issue-driven playbooks with checks and escalation
  - [ ] Track usage and field notes
  - [ ] Search and categorize playbooks
- [ ] Client references
  - [ ] Client profile pages with notes and quirks
  - [ ] Link clients to logs, tasks, and knowledge
- [ ] Time / invoice tracking
  - [ ] Shift/task time entry
  - [ ] Invoice-cycle summary
  - [ ] Invoice preview/export

### 2. MSP professional development
- [ ] MSP Skills page improvements
  - [ ] Persist readiness states reliably
  - [ ] Improve search/filter behavior
- [ ] MSP Scenarios
  - [ ] Fix dropdown styling bug
  - [ ] Persist scenario progress
  - [ ] Add more practice scenarios
- [ ] Ticket Notes Trainer
  - [ ] Ensure accessible nav link
  - [ ] Improve training flow and examples
- [ ] Evidence Pack
  - [ ] Add copy-summary button
  - [ ] Improve output formatting
- [ ] MSP Roadmap
  - [ ] Show all stages clearly
  - [ ] Tie roadmap recommendations to user progress
- [ ] Next Best Action / PD coaching
  - [ ] Recommend one clear next action
  - [ ] Add “why this?” explanation
  - [ ] Use local progress data for decisions

### 3. Navigation, branding, and polish
- [ ] Fix broken / coming-soon links in navigation
- [ ] Hide or label pages returning 404
- [ ] Set proper app metadata and browser titles
- [ ] Improve mobile/responsive layouts
- [ ] Add empty states and loading states
- [ ] Improve accessibility and keyboard navigation
- [ ] Ensure local persistence works across refresh

### 4. Search and discovery
- [ ] Expand universal search to all content types
  - [ ] Work logs
  - [ ] Tasks
  - [ ] Knowledge
  - [ ] Playbooks
  - [ ] Clients
  - [ ] Learning items
- [ ] Add type-based result filtering
- [ ] Add search result highlighting
- [ ] Add recent searches and suggested queries

## Suggested implementation sequence
1. Fix navigation, metadata, and page discovery
2. Build Work Logs and Tasks
3. Add Knowledge Base and Playbooks
4. Add Client reference pages and time/invoice tracking
5. Polish MSP PD flows and learning recommendations
6. Expand search coverage and discovery

## Notes from the docs
- The PRD requires shift prep, work logs, tasks, knowledge, playbooks, clients, time logging, and learning tracking.
- User stories require quick capture, follow-up persistence, searchable knowledge, and invoice preparation.
- QA doc calls out `/msp-skills`, `/msp-scenarios`, `/ticket-notes`, `/evidence-pack`, and `/msp-roadmap` as key pages.
- Proposed improvements call for PendingActionTracker, OnsiteChecklist, tool primers, alert sanitization, and daily briefing flow.

## Immediate next actions
- [x] Fix app metadata and browser title branding
- [x] Add persistent follow-up tracking to the dashboard
- [ ] Extend universal search to tasks and work logs
- [ ] Add Evidence Pack copy-summary button
- [ ] Fix MSP scenario dropdown styling and persistence
- [x] Create initial Work Log and Task skeleton with local persistence

## Progress tracking
- [x] Universal search added
- [x] Top navigation scroll position fixed
- [x] Search page created
- [ ] Work Logs
- [ ] Tasks
- [ ] Knowledge Base
- [ ] Playbooks
- [ ] Clients
- [ ] Time/invoice tracking
- [ ] PD coaching and recommendation engine
- [ ] Expanded search coverage

## What’s left
The app still needs most of the operational capture and workflow features:
- full log/task/client capture
- knowledge and playbook linking
- time/invoice support
- improved PD recommendation
- better navigation and discovery
- mobile/responsive polish
- accessibility and QA fixes

---

> Keep this file updated as work is completed. Use it as the single source of truth for what remains to be built.
