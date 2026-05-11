# Avance Work Companion - TODO List

## Overview
This TODO list outlines all remaining tasks to build and optimize the Avance Work Companion app, making it as useful as possible for Josh's part-time MSP work at Avance Business Technology. The app focuses on preparation, knowledge capture, continuity, task management, and professional development in IT MSP skills.

## Phase 1: Project Setup & Core Infrastructure

### 1.1 Initialize Next.js Project
- [x] Create new Next.js project with TypeScript
- [x] Configure Tailwind CSS and shadcn/ui
- [x] Set up project structure (app/, components/, lib/, types/)
- [x] Configure local storage (IndexedDB/Dexie) for data persistence
- [x] Set up PWA capabilities for offline use
- [x] Configure dark mode support

### 1.2 Data Models & Schema
- [x] Define TypeScript interfaces for all entities:
  - Shift, WorkLog, Task, KnowledgeEntry, Playbook, Client, LearningItem, Invoice
- [x] Set up Zod schemas for validation
- [x] Implement local database layer with Dexie
- [x] Create seed data based on `docs/guides/sample_seed_data.md`

## Phase 2: Core Features Implementation

### 2.1 Dashboard
- [x] Build main dashboard layout with cards for:
  - Next shift information
  - Pre-shift checklist status
  - Outstanding tasks by priority
  - Recent work logs
  - Current invoice cycle hours
  - Quick actions (new log, new task, search)
- [x] Implement responsive grid layout
- [x] Add dashboard widgets for key metrics
- [x] Make dashboard load instantly on app open

### 2.2 Shift Management
- [x] Create shift scheduling with recurring Mon/Wed patterns
- [x] Build shift creation form with validation
- [ ] Build shift detail pages with prep checklists
- [x] Implement shift status tracking (scheduled, in-progress, completed)
- [ ] Add time logging per shift
- [ ] Link shifts to work logs and tasks

### 2.3 Work Logs & Handover
- [ ] Build work log creation form (quick capture in <30 seconds)
- [ ] Implement work log list with filtering and search
- [ ] Add linking to clients, tasks, and knowledge entries
- [ ] Create handover summary generation
- [ ] Add export capabilities for shift reports

### 2.4 Task Management
- [ ] Implement task CRUD operations
- [ ] Add priority levels and due dates
- [ ] Build task status workflow (new → in-progress → blocked → done)
- [ ] Add task linking to clients and work logs
- [ ] Implement overdue task highlighting

### 2.5 Knowledge Base
- [ ] Create knowledge entry editor with rich text
- [ ] Implement tagging and categorization
- [ ] Add confidence levels and verification dates
- [ ] Build search and filtering capabilities
- [ ] Add linking to clients, tasks, and playbooks

### 2.6 Troubleshooting Playbooks
- [ ] Build playbook creation and editing interface
- [ ] Implement step-by-step workflow builder
- [ ] Add field usage logging and notes
- [ ] Create playbook runner for live troubleshooting
- [ ] Add playbook search and categorization

### 2.7 Client Management
- [ ] Build client profile pages with work-related notes (no private contact info)
- [ ] Add environment notes and known quirks
- [ ] Implement client linking to tasks, logs, and knowledge (anonymized references)
- [ ] Add client search and filtering by sector/issues
- [ ] Include sector/industry tracking for work patterns

### 2.8 Tools & Systems Reference
- [ ] Create reference pages for Avance tools (Datto RMM, RustDesk, etc.)
- [ ] Add public company information sections
- [ ] Build personal notes integration
- [ ] Implement quick links and bookmarks
- [ ] Add caution banners for unverified info

### 2.9 Time Logging & Invoicing
- [ ] Implement time entry per shift/task
- [ ] Build invoice generation from logged hours
- [ ] Add rate management and billing status tracking
- [ ] Create invoice preview and export
- [ ] Add contractor-style reporting

### 2.10 Learning Tracker & Professional Development
- [ ] Build learning item creation with MSP skill focus
- [ ] Implement confidence scoring and progress tracking
- [ ] Add "seen in real work" and "ask team" flags
- [ ] Create PD goal setting and milestone tracking
- [ ] Add spaced review prompts for skill reinforcement

### 2.11 Global Search
- [ ] Implement full-text search across all content types
- [ ] Add type-based filtering (logs, tasks, knowledge, etc.)
- [ ] Build search result highlighting
- [ ] Add recent searches and suggestions
- [ ] Optimize search performance

## Phase 3: User Experience & Polish

### 3.1 Navigation & Layout
- [ ] Build consistent navigation structure
- [ ] Implement keyboard shortcuts for quick actions
- [ ] Add breadcrumbs and back navigation
- [ ] Create mobile-responsive layouts
- [ ] Add loading states and empty states

### 3.2 Forms & Interactions
- [ ] Implement auto-save for drafts
- [ ] Add form validation with helpful error messages
- [ ] Build quick capture modals/drawers
- [ ] Add drag-and-drop for reordering
- [ ] Implement inline editing where appropriate

### 3.3 Accessibility & Usability
- [ ] Ensure WCAG 2.1 AA compliance
- [ ] Add proper ARIA labels and semantic HTML
- [ ] Implement keyboard navigation
- [ ] Test with screen readers
- [ ] Add focus management for modals

### 3.4 Performance Optimization
- [ ] Implement code splitting and lazy loading
- [ ] Optimize bundle size (<500KB)
- [ ] Add service worker for caching
- [ ] Implement virtual scrolling for large lists
- [ ] Add debounced search and filtering

## Phase 4: Professional Development Integration

### 4.1 PD-Focused Features
- [ ] Add PD progress dashboard widget
- [ ] Implement skill gap analysis
- [ ] Build learning path recommendations
- [ ] Add certification tracking
- [ ] Create PD goal reminders and notifications

### 4.2 MSP Skill Development
- [ ] Add predefined MSP skill categories
- [ ] Implement skill assessment tools
- [ ] Build progress visualization (charts/graphs)
- [ ] Add peer learning integration (future)
- [ ] Create PD milestone celebrations

### 4.3 MSP Skills Academy Expansion
- [x] Document MSP Skills Academy specification in `docs/professional_development/msp_skills_academy.md`
- [x] Document MSP PD implementation checklist in `docs/professional_development/msp_pd_growth_todo.md`
- [ ] Create MSP skill taxonomy data file (`app/src/data/mspSkills.ts`)
- [ ] Create realistic MSP scenario data file (`app/src/data/mspScenarios.ts`)
- [ ] Add MSP Skills Matrix page (`/msp-skills`)
- [ ] Add MSP Scenario Trainer page (`/msp-scenarios`)
- [ ] Add Ticket Notes Trainer page (`/ticket-notes`)
- [ ] Add Evidence Pack page (`/evidence-pack`)
- [ ] Add MSP Roadmap page (`/msp-roadmap`)
- [ ] Add client communication practice prompts and model responses
- [ ] Add simple rule-based next best action recommendations
- [ ] Connect completed scenarios, notes, and evidence outputs to existing learning/PD records where practical
- [ ] Update app navigation with MSP professional development sections

## Phase 5: Advanced Features & Integration

### 5.1 Data Management
- [ ] Implement JSON export/import
- [ ] Add data backup reminders
- [ ] Build data migration tools
- [ ] Add bulk operations for cleanup
- [ ] Implement data validation on import

### 5.2 Optional Sync (Future)
- [ ] Design Supabase integration for cloud sync
- [ ] Add selective sync options
- [ ] Implement conflict resolution
- [ ] Add offline-first sync strategy
- [ ] Build multi-device support

### 5.3 Analytics & Insights
- [ ] Add usage analytics (local only)
- [ ] Build productivity insights
- [ ] Implement trend analysis for tasks/logs
- [ ] Add PD progress analytics
- [ ] Create reporting dashboards

## Phase 6: Testing & Deployment

### 6.1 Testing
- [ ] Write unit tests for core logic
- [ ] Add integration tests for data flow
- [ ] Perform cross-browser testing
- [ ] Test offline functionality
- [ ] Conduct usability testing with target workflows

### 6.2 Deployment
- [ ] Set up build process for production
- [ ] Configure PWA manifest
- [ ] Add deployment to GitHub Pages/Netlify
- [ ] Set up CI/CD pipeline (optional)
- [ ] Create installation instructions

### 6.3 Documentation
- [ ] Update app README with setup instructions
- [ ] Create user onboarding flow
- [ ] Add in-app help and tooltips
- [ ] Build troubleshooting guide
- [ ] Create video walkthroughs (future)

## Phase 7: Launch & Iteration

### 7.1 Launch Preparation
- [ ] Populate with realistic seed data
- [ ] Test end-to-end workflows
- [ ] Add final polish and animations
- [ ] Create backup/restore testing
- [ ] Prepare for first week of use

### 7.2 Post-Launch Improvements
- [ ] Monitor usage and gather feedback
- [ ] Add most-requested features
- [ ] Optimize based on real MSP workflows
- [ ] Enhance PD tracking based on Josh's needs
- [ ] Iterate on UI/UX based on usage patterns

### 7.3 Long-term Maintenance
- [ ] Plan for Avance-specific updates
- [ ] Add new tool integrations as needed
- [ ] Maintain seed data relevance
- [ ] Update PD content regularly
- [ ] Plan for scalability if team expands

## Success Metrics
- [ ] App loads in <2 seconds
- [ ] Quick capture takes <30 seconds
- [ ] Search finds relevant results in <1 second
- [ ] PD progress is measurable and motivating
- [ ] Josh can prepare for shifts in <15 minutes
- [ ] Continuity between shifts is seamless

## Risk Mitigation
- [ ] Regular data backups
- [ ] Privacy-first design (no external data sharing)
- [ ] Offline functionality for field work
- [ ] Simple architecture to avoid complexity
- [ ] Focus on core workflows over feature creep

## Timeline Estimate
- **Phase 1-2**: 2-4 weeks (core app development)
- **Phase 3**: 1-2 weeks (polish and UX)
- **Phase 4**: 1 week (PD integration)
- **Phase 5-6**: 1-2 weeks (advanced features and deployment)
- **Phase 7**: Ongoing (iteration and maintenance)

## Priority Guidelines
1. **Must-have**: Dashboard, shift prep, work logs, tasks, knowledge base
2. **Should-have**: Playbooks, clients, time logging, search
3. **Nice-to-have**: Advanced PD features, analytics, sync
4. **Future**: Team features, external integrations

## Dependencies
- Next.js 14+ with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui for components
- Dexie for IndexedDB
- Date-fns for date handling
- Fuse.js for search
- PWA support for offline use

This TODO list provides a comprehensive roadmap to build a highly useful Avance Work Companion that maximizes Josh's effectiveness in his MSP role while prioritizing professional development.
